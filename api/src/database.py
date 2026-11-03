from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, declarative_base

from src.config import settings


SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{settings.DB_USER}:"
    f"{settings.DB_PASS}@"
    f"{settings.DB_HOST}/"
    f"{settings.DB_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


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
