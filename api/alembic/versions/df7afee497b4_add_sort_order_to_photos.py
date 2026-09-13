"""add sort_order to photos

Revision ID: df7afee497b4
Revises: 
Create Date: 2026-02-09 23:17:37.698439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df7afee497b4'
down_revision: Union[str, Sequence[str], None] = '2ea64bbab31e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "photos",
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )
    # Backfill existing rows: assign sequential sort_order based on created_at DESC
    # so current display order is preserved (newest = 0, next = 1, etc.)
    op.execute(
        """
        UPDATE photos
        SET sort_order = sub.row_num
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 AS row_num
            FROM photos
        ) AS sub
        WHERE photos.id = sub.id
        """
    )


def downgrade() -> None:
    op.drop_column("photos", "sort_order")
