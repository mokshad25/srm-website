from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _create_engine():
    url = get_settings().database_url
    options = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=options, pool_pre_ping=True)


engine = _create_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def verify_database_connection() -> None:
    from sqlalchemy import text

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
