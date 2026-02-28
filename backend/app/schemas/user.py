from pydantic import BaseModel, field_validator
from typing import Optional

# Bcrypt limit; keep in sync with app.core.security
BCRYPT_MAX_BYTES = 72


def _truncate_password(v: str) -> str:
    """Ensure password fits bcrypt's 72-byte limit."""
    if not v:
        return v
    enc = v.encode("utf-8")
    if len(enc) <= BCRYPT_MAX_BYTES:
        return v
    return enc[:BCRYPT_MAX_BYTES].decode("utf-8", errors="ignore")


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    status: Optional[int] = 1  # 1=active, 0=inactive

    @field_validator("password")
    @classmethod
    def truncate_password(cls, v: str) -> str:
        return _truncate_password(v)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    status: Optional[int] = None

    @field_validator("password")
    @classmethod
    def truncate_password(cls, v: Optional[str]) -> Optional[str]:
        return _truncate_password(v) if v else v

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    status: int
    # password intentionally excluded from API response

    class Config:
        from_attributes = True

