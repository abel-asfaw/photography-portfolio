from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings


SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{settings.db_user}:"
    f"{settings.db_pass}@"
    f"{settings.db_host}/"
    f"{settings.db_name}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Provides a database session for handling database operations.

    :yield: The database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
