from datetime import datetime
from uuid import UUID

from sqlalchemy import TIMESTAMP, Integer, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class Photo(Base):
    """
    Represents the photos table in the database.
    """

    __tablename__ = "photos"

    id: Mapped[UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    name: Mapped[str] = mapped_column(Text, unique=True)
    url: Mapped[str] = mapped_column(Text, unique=True)
    sort_order: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=text("now()")
    )
