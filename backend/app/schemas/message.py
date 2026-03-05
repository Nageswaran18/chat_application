from datetime import datetime
from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    media_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
