from datetime import timedelta, datetime
import bcrypt
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db
from app.models.user import User

# Used by Swagger "Authorize" (form-based). Use POST /users/token with username=email, password.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/users/token")

# Bcrypt only accepts passwords up to 72 bytes
BCRYPT_MAX_PASSWORD_BYTES = 72


def _password_to_safe_bytes(password: str) -> bytes:
    """Return password as bytes, at most 72 bytes (bcrypt limit)."""
    if not isinstance(password, str):
        password = str(password)
    return password.encode("utf-8")[:BCRYPT_MAX_PASSWORD_BYTES]


def hash_password(password: str) -> str:
    """Hash password with bcrypt. Safe for passwords longer than 72 bytes (truncated)."""
    safe = _password_to_safe_bytes(password)
    hashed = bcrypt.hashpw(safe, bcrypt.gensalt())
    return hashed.decode("utf-8")


def _is_bcrypt_hash(value: str) -> bool:
    """Bcrypt hashes start with $2b$ or $2a$."""
    return value.startswith("$2b$") or value.startswith("$2a$")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if _is_bcrypt_hash(hashed_password):
        safe = _password_to_safe_bytes(plain_password)
        return bcrypt.checkpw(safe, hashed_password.encode("utf-8"))
    # Legacy: password was stored in plain text (e.g. before hashing was added)
    return plain_password == hashed_password


def create_access_token(data: dict) -> str:
    s = get_settings()
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=s.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, s.SECRET_KEY, algorithm=s.ALGORITHM)


def decode_access_token(token: str):
    s = get_settings()
    try:
        return jwt.decode(token, s.SECRET_KEY, algorithms=[s.ALGORITHM])
    except JWTError:
        return None


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency: validates JWT and returns the authenticated User. Use on protected routes."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if user.status != User.STATUS_ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    return user














