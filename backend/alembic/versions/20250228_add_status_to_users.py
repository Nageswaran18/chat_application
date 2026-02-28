"""Add status column to users

Revision ID: 20250228_status
Revises:
Create Date: 2025-02-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20250228_status"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add status column (1=active, 0=inactive). Safe if column already exists.
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS status INTEGER DEFAULT 1"
    )
    # Set any NULLs to 1 (in case column existed without default)
    op.execute("UPDATE users SET status = 1 WHERE status IS NULL")


def downgrade() -> None:
    op.drop_column("users", "status")
