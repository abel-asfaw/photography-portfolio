"""enable row level security on photos

Revision ID: 2a22f2ab081d
Revises: df7afee497b4
Create Date: 2026-11-02 19:30:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2a22f2ab081d"
down_revision: str | Sequence[str] | None = "df7afee497b4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # In Supabase, tables in the public schema are reachable through the Data
    # API with the publishable key. Enabling RLS with no policies denies that
    # access. The API connects as the table owner, which RLS doesn't apply to.
    op.execute("ALTER TABLE photos ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.execute("ALTER TABLE photos DISABLE ROW LEVEL SECURITY")
