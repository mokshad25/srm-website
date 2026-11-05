import logging

from fastapi import APIRouter
from sqlalchemy.exc import SQLAlchemyError

from app.database.connection import verify_database_connection

router = APIRouter()


@router.get("/health")
def health_check():
    try:
        verify_database_connection()
    except SQLAlchemyError:
        logging.getLogger(__name__).exception("Database health check failed")
        return {"status": "degraded", "database": "unavailable"}
    return {"status": "healthy", "database": "connected"}
