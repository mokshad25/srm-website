import hashlib
import hmac
from datetime import datetime, timezone
from pathlib import PurePosixPath
from typing import Literal

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.connection import get_db
from app.database.models import Document, DocumentChunk, Feedback, Message
from app.ingestion.crawler import fetch_official_pdf, fetch_public_document
from app.ingestion.indexer import index_document
from app.ingestion.pdf_parser import parse_pdf
from app.schemas.documents import IngestRequest
from app.utils.validators import validate_official_url

router = APIRouter()


def require_admin(authorization: str | None = Header(default=None)) -> None:
    expected = get_settings().admin_api_key
    if not expected:
        raise HTTPException(status_code=503, detail="Admin API is disabled until ADMIN_API_KEY is configured.")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Admin authentication required.")


@router.post("/ingest", dependencies=[Depends(require_admin)])
def ingest_source(payload: IngestRequest, db: Session = Depends(get_db)):
    url = validate_official_url(str(payload.url))
    title, text = fetch_public_document(url)
    document = index_document(
        db,
        title=payload.title or title,
        category=payload.category,
        campus=payload.campus,
        source_url=url,
        text=text,
        academic_year=payload.academic_year,
    )
    return {"id": document.id, "title": document.title, "chunk_count": len(document.chunks)}


@router.get("/documents", dependencies=[Depends(require_admin)])
def list_documents(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Document, func.count(DocumentChunk.id))
        .outerjoin(DocumentChunk)
        .group_by(Document.id)
        .order_by(Document.created_at.desc())
    ).all()
    return [
        {
            "id": document.id,
            "title": document.title,
            "category": document.category,
            "campus": document.campus,
            "source_url": document.source_url,
            "academic_year": document.academic_year,
            "last_verified_at": document.last_verified_at,
            "chunk_count": count,
        }
        for document, count in rows
    ]


@router.post("/documents/upload", dependencies=[Depends(require_admin)])
async def upload_document(
    file: UploadFile = File(...),
    source_url: str = Form(...),
    category: str = Form(...),
    title: str | None = Form(default=None),
    academic_year: str | None = Form(default=None),
    campus: Literal["Kattankulathur"] = Form(default="Kattankulathur"),
    db: Session = Depends(get_db),
):
    validate_official_url(source_url)
    if category not in {"academics", "admissions", "campus"}:
        raise HTTPException(status_code=422, detail="Category must be academics, admissions, or campus.")
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Only PDF uploads are supported.")
    content = await file.read(get_settings().upload_max_bytes + 1)
    if len(content) > get_settings().upload_max_bytes:
        raise HTTPException(status_code=413, detail="PDF exceeds the configured upload limit.")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Uploaded file is not a valid PDF.")
    source_content = fetch_official_pdf(source_url)
    if not hmac.compare_digest(hashlib.sha256(content).digest(), hashlib.sha256(source_content).digest()):
        raise HTTPException(status_code=422, detail="Uploaded PDF does not match the official PDF at source_url.")
    try:
        text = parse_pdf(content)
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Unable to parse the uploaded PDF.") from exc
    if not text:
        raise HTTPException(status_code=422, detail="No readable text was extracted from the PDF.")
    filename = PurePosixPath(file.filename or "SRMIST document.pdf").name
    document = index_document(
        db,
        title=title or filename,
        category=category,
        campus=campus,
        source_url=source_url,
        text=text,
        academic_year=academic_year,
    )
    return {"id": document.id, "title": document.title, "chunk_count": len(document.chunks)}


@router.patch("/documents/{document_id}", dependencies=[Depends(require_admin)])
def update_document(
    document_id: str,
    academic_year: str | None = None,
    verified: bool = False,
    db: Session = Depends(get_db),
):
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    if academic_year is not None:
        if len(academic_year) > 20:
            raise HTTPException(status_code=422, detail="Academic year is too long.")
        document.academic_year = academic_year
    if verified:
        document.last_verified_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "updated"}


@router.delete("/documents/{document_id}", dependencies=[Depends(require_admin)])
def delete_document(document_id: str, db: Session = Depends(get_db)):
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete(document)
    db.commit()
    return {"status": "deleted"}


@router.get("/stats", dependencies=[Depends(require_admin)])
def admin_stats(db: Session = Depends(get_db)):
    return {
        "documents": db.scalar(select(func.count()).select_from(Document)) or 0,
        "chunks": db.scalar(select(func.count()).select_from(DocumentChunk)) or 0,
        "last_ingestion": db.scalar(select(func.max(Document.last_verified_at))),
    }


@router.get("/unanswered", dependencies=[Depends(require_admin)])
def unanswered_questions(db: Session = Depends(get_db)):
    replies = db.scalars(
        select(Message)
        .where(Message.role == "assistant", Message.status == "unverified")
        .order_by(Message.created_at.desc())
        .limit(100)
    ).all()
    result = []
    for reply in replies:
        question = db.scalar(
            select(Message)
            .where(Message.conversation_id == reply.conversation_id, Message.role == "user", Message.created_at < reply.created_at)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        if question:
            result.append({"question": question.content, "created_at": reply.created_at})
    return result


@router.get("/feedback", dependencies=[Depends(require_admin)])
def list_feedback(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Feedback, Message)
        .join(Message, Feedback.message_id == Message.id)
        .order_by(Feedback.created_at.desc())
        .limit(100)
    ).all()
    return [
        {
            "rating": feedback.rating,
            "comment": feedback.comment,
            "answer": message.content,
            "created_at": feedback.created_at,
        }
        for feedback, message in rows
    ]
