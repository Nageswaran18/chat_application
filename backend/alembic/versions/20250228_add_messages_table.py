"""Add messages table for individual/direct messages

Revision ID: 20250228_msgs
Revises: 20250228_status
Create Date: 2025-02-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20250228_msgs"
down_revision: Union[str, None] = "20250228_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("sender_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("receiver_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
    )
    op.create_index("ix_messages_sender_id", "messages", ["sender_id"], unique=False)
    op.create_index("ix_messages_receiver_id", "messages", ["receiver_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_messages_receiver_id", table_name="messages")
    op.drop_index("ix_messages_sender_id", table_name="messages")
    op.drop_table("messages")
