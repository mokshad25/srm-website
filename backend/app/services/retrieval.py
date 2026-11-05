import math
import re
import unicodedata
from dataclasses import dataclass

from sqlalchemy import and_, cast, or_, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.connection import engine
from app.database.models import Document, DocumentChunk
from app.services.embeddings import embed_text


@dataclass(frozen=True)
class RetrievedChunk:
    chunk: DocumentChunk
    similarity: float


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    if len(left) != len(right):
        return 0.0
    dot = sum(a * b for a, b in zip(left, right, strict=False))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    score = dot / (left_norm * right_norm) if left_norm and right_norm else 0.0
    return max(-1.0, min(1.0, score))


def _normalized_content(content: str) -> str:
    normalized = unicodedata.normalize("NFKC", content).casefold()
    return re.sub(r"\W+", " ", normalized).strip()


def _official_url_clause():
    conditions = []
    for domain in get_settings().source_domain_list:
        conditions.extend(
            [
                Document.source_url == f"https://{domain}",
                Document.source_url.like(f"https://{domain}/%"),
                Document.source_url.like(f"https://%.{domain}/%"),
            ]
        )
    return or_(*conditions) if conditions else and_(False)


def _year_variants(year: str) -> tuple[str, str]:
    start, end = year.split("-", maxsplit=1)
    return year, f"{start}-{start[:2]}{end}"


def retrieve_evidence(
    db: Session,
    question: str,
    campus: str,
    category: str | None = None,
    academic_year: str | None = None,
) -> list[RetrievedChunk]:
    query_vector = embed_text(question)
    statement = (
        select(DocumentChunk)
        .join(Document)
        .where(
            Document.campus == campus,
            DocumentChunk.embedding.is_not(None),
            _official_url_clause(),
        )
    )
    if category:
        statement = statement.where(Document.category == category)
    if academic_year:
        statement = statement.where(Document.academic_year.in_(_year_variants(academic_year)))

    if engine.dialect.name == "postgresql":
        from pgvector.sqlalchemy import Vector

        vector_column = cast(DocumentChunk.embedding, Vector(get_settings().embedding_dimensions))
        distance = vector_column.cosine_distance(query_vector)
        rows = db.scalars(statement.order_by(distance).limit(get_settings().retrieval_top_k)).all()
        scored = [RetrievedChunk(chunk=chunk, similarity=_cosine_similarity(query_vector, chunk.embedding)) for chunk in rows]
    else:
        chunks = db.scalars(statement).all()
        scored = [
            RetrievedChunk(chunk=chunk, similarity=_cosine_similarity(query_vector, chunk.embedding))
            for chunk in chunks
        ]
        scored.sort(key=lambda result: result.similarity, reverse=True)

    threshold = get_settings().retrieval_min_similarity
    margin = max(0.0, get_settings().context_similarity_margin)
    if not scored or scored[0].similarity < threshold:
        return []
    cutoff = max(threshold, scored[0].similarity - margin)
    selected: list[RetrievedChunk] = []
    seen_content: set[str] = set()
    for candidate in scored:
        if candidate.similarity < cutoff:
            continue
        normalized = _normalized_content(candidate.chunk.content)
        if not normalized or normalized in seen_content:
            continue
        seen_content.add(normalized)
        selected.append(candidate)
        if len(selected) >= max(1, min(get_settings().context_chunk_limit, get_settings().retrieval_top_k)):
            break
    return selected


def retrieve_chunks(
    db: Session,
    question: str,
    campus: str,
    category: str | None = None,
) -> list[DocumentChunk]:
    return [result.chunk for result in retrieve_evidence(db, question, campus, category)]
