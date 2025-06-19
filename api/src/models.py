from datetime import datetime
from sqlalchemy import UUID, TIMESTAMP, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class Photos(Base):
    """
    Represents the photos table in the database.
    """

    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(
        UUID, primary_key=True, nullable=False, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    url: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
