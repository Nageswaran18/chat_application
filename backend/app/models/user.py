from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    STATUS_ACTIVE = 1
    STATUS_INACTIVE = 0

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Integer, default=1)  # 1=active, 0=inactive


