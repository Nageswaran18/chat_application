import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings

# WebSocket support: uvicorn must run with the same Python that has 'websockets' installed
try:
    import websockets  # noqa: F401
except ImportError:
    print("ERROR: WebSocket support requires 'websockets'. Run: pip install websockets", file=sys.stderr)
    print("Or: pip install 'uvicorn[standard]'", file=sys.stderr)
from app.db.database import Base, engine
from app.routes import user as user_routes
from app.routes import messages as messages_routes
from app.routes import media as media_routes
from app.websocket import chat as ws_chat
from app.models.message import Message  # noqa: F401 - register for create_all

settings = get_settings()

app = FastAPI(
    title="Chat Application API",
    description="Backend API for the chat application",
    version="1.0.0",
)

cors_origins_list = settings.get_cors_origins_list()
if not cors_origins_list:
    print("WARNING: CORS_ORIGINS is empty. Set env var CORS_ORIGINS on Render to your frontend URL.", file=sys.stderr)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(user_routes.router, prefix="/api/v1")
app.include_router(messages_routes.router, prefix="/api/v1")
app.include_router(media_routes.router, prefix="/api/v1")
# WebSocket chat endpoint at /ws/chat (no /api/v1 prefix)
app.include_router(ws_chat.router)

# Serve uploaded images at /uploads (for chat media)
uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

Base.metadata.create_all(bind=engine)
@app.get("/")
def root():
    return {"message": "working", "docs": "/docs"}


@app.get("/health")
def health():
    """For load balancers and orchestrators. Returns 200 if the app is up."""
    return {"status": "ok"}


@app.get("/health/ready")
def health_ready():
    """Readiness: checks DB connectivity. Use for k8s readinessProbe."""
    from sqlalchemy import text
    try:
        from app.db.database import engine
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "detail": "database unavailable", "error": str(e)},
        )
    return {"status": "ok"}