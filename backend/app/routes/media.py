"""
Upload and serve media (images) for chat. Uploaded files are stored under backend/uploads/.
"""
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/media", tags=["Media"])

# Allowed image types and extensions
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
EXT_BY_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}
MAX_SIZE_MB = 10


def get_uploads_dir() -> Path:
    """Directory for uploaded files (backend/uploads). Created if missing."""
    base = Path(__file__).resolve().parents[2]  # backend/
    uploads = base / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    return uploads


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload an image for chat. Returns URL path to use in messages (e.g. /uploads/xxx.jpg).
    Max size 10 MB. Allowed: JPEG, PNG, GIF, WebP.
    """
    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )
    ext = EXT_BY_TYPE.get(content_type, ".jpg")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    uploads_dir = get_uploads_dir()
    file_path = uploads_dir / unique_name

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_SIZE_MB} MB.")

    with open(file_path, "wb") as f:
        f.write(contents)

    # Return path that the frontend can use: base URL + /uploads/unique_name
    url_path = f"/uploads/{unique_name}"
    return JSONResponse(content={"url": url_path})
