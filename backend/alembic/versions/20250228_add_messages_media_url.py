"""Add media_url to messages for image/media sharing

Revision ID: 20250228_media
Revises: 20250228_msgs
Create Date: 2025-02-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20250228_media"
down_revision: Union[str, None] = "20250228_msgs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("messages", sa.Column("media_url", sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column("messages", "media_url")
