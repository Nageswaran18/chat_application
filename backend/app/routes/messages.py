"""
REST API for messages. Use GET to verify messages are saved (see in Network tab).
Sending is done via WebSocket; this endpoint is for listing only.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/", response_model=list[MessageResponse])
def list_messages(
    with_user_id: Optional[int] = Query(None, description="Filter to conversation with this user ID"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List messages where current user is sender or receiver.
    Optional: ?with_user_id=2 to see only messages with that user.
    You can call this from the browser (Network tab) or Swagger to verify DB has data.
    """
    q = db.query(Message).filter(
        or_(
            Message.sender_id == current_user.id,
            Message.receiver_id == current_user.id,
        )
    )
    if with_user_id is not None:
        q = q.filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == with_user_id),
                (Message.receiver_id == current_user.id) & (Message.sender_id == with_user_id),
            )
        )
    q = q.order_by(Message.created_at.desc()).limit(limit)
    return q.all()
