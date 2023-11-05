from sqlalchemy import Column, String
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text

from .database import Base


class Photos(Base):
    """Class representing a photos db table"""

    __tablename__ = "photos"

    id = Column(String(64), primary_key=True, nullable=False)
    name = Column(String(16), nullable=False, unique=True)
    url = Column(String(64), nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text('now()'))
