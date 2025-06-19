from datetime import datetime
from sqlalchemy import String, TIMESTAMP, text
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class Photos(Base):
    """
    Represents the photos table in the database.
    """

    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String(16), nullable=False, unique=True)
    url: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
