"""create photos table

Revision ID: 2ea64bbab31e
Revises: 
Create Date: 2023-11-08 21:03:07.698056

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2ea64bbab31e"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "photos",
        sa.Column("id", sa.String(64), primary_key=True, nullable=False),
        sa.Column("name", sa.String(16), nullable=False, unique=True),
        sa.Column("url", sa.String(64), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("photos")
 