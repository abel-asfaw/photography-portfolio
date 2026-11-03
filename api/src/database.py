from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from src.config import settings

# URL.create escapes the credentials, so a password with characters like
# "@" or "/" still produces a valid URL.
DATABASE_URL = URL.create(
    "postgresql+psycopg2",
    username=settings.DB_USER,
    password=settings.DB_PASS,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    database=settings.DB_NAME,
)

# The Supabase pooler closes idle connections, so check each one before use
# rather than failing the first request after a quiet period.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    """
    FastAPI dependency that provides a database session for one request.

    Errors propagate unchanged; the app's exception handlers turn database
    errors into responses (see src/exceptions.py). Closing the session rolls
    back anything left uncommitted.

    :yield: The database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]
