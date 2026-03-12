"""Add media_url to messages for image/media sharing

Revision ID: 20250228_media
Revises: 20250228_msgs
Create Date: 2025-02-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = "20250228_media"
down_revision: Union[str, None] = "20250228_msgs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [c["name"] for c in inspector.get_columns("messages")]
    if "media_url" in columns:
        return  # Column already exists; skip
    op.add_column("messages", sa.Column("media_url", sa.String(512), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [c["name"] for c in inspector.get_columns("messages")]
    if "media_url" not in columns:
        return
    op.drop_column("messages", "media_url")
