"""
Individual/direct message model. Stores each message with sender, receiver, and content.
"""
from datetime import datetime

from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime

from app.db.database import Base


class Message(Base):
    """Table for storing individual (direct) messages between users."""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)  # text caption; empty string for image-only
    media_url = Column(String(512), nullable=True, index=False)  # relative path e.g. /uploads/xxx.jpg
    created_at = Column(DateTime, default=datetime.utcnow)
