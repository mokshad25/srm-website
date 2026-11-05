import asyncio
import logging

from sqlalchemy import select

from app.config import get_settings
from app.database.connection import SessionLocal
from app.database.models import Document
from app.ingestion.crawler import fetch_public_document
from app.ingestion.indexer import index_document
from app.utils.validators import validate_official_url

logger = logging.getLogger(__name__)


async def refresh_indexed_sources() -> None:
    with SessionLocal() as db:
        sources = db.scalars(select(Document)).all()
        source_data = [
            (doc.source_url, doc.title, doc.category, doc.campus, doc.academic_year)
            for doc in sources
        ]
    for url, title, category, campus, academic_year in source_data:
        try:
            validate_official_url(url)
            fetched_title, text = await asyncio.to_thread(fetch_public_document, url)
            with SessionLocal() as db:
                index_document(
                    db,
                    title=title or fetched_title,
                    category=category,
                    campus=campus,
                    source_url=url,
                    text=text,
                    academic_year=academic_year,
                )
        except Exception:
            logger.exception("Scheduled source refresh failed for %s", url)


async def run_scheduler() -> None:
    interval = max(1, get_settings().ingestion_interval_hours) * 3600
    while True:
        await asyncio.sleep(interval)
        await refresh_indexed_sources()
