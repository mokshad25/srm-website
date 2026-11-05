import hashlib
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Document, DocumentChunk
from app.ingestion.chunker import chunk_text
from app.services.embeddings import embed_text


def index_document(
    db: Session,
    *,
    title: str,
    category: str,
    campus: str,
    source_url: str,
    text: str,
    academic_year: str | None = None,
) -> Document:
    content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    document = db.scalar(select(Document).where(Document.source_url == source_url))
    if document and document.content_hash == content_hash:
        document.title = title
        document.category = category
        document.campus = campus
        if academic_year is not None:
            document.academic_year = academic_year
        document.last_verified_at = datetime.now(timezone.utc)
        for chunk in document.chunks:
            chunk.chunk_metadata = {"category": category, "campus": campus, "title": title}
        db.commit()
        return document

    chunks = chunk_text(text)
    vectors = [embed_text(chunk) for chunk in chunks]
    if document:
        document.title = title
        document.category = category
        document.campus = campus
        document.academic_year = academic_year
        document.content_hash = content_hash
        document.last_verified_at = datetime.now(timezone.utc)
        document.chunks.clear()
        db.flush()
    else:
        document = Document(
            title=title,
            category=category,
            campus=campus,
            source_url=source_url,
            academic_year=academic_year,
            content_hash=content_hash,
            last_verified_at=datetime.now(timezone.utc),
        )
        db.add(document)
        db.flush()
    document.chunks.extend(
        DocumentChunk(
            content=chunk,
            embedding=vector,
            chunk_index=index,
            chunk_metadata={"category": category, "campus": campus, "title": title},
        )
        for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True))
    )
    db.commit()
    db.refresh(document)
    return document
