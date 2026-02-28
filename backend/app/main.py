from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import Base, engine
from app.routes import user as user_routes

settings = get_settings()

app = FastAPI(
    title="Chat Application API",
    description="Backend API for the chat application",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router, prefix="/api/v1")

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "working", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}