"""
Application configuration from environment variables.
Use .env file in backend root for local development; set env vars in production.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Load from env (and optional .env file). Never commit .env with secrets."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql://postgres:admin@localhost:5432/chat_application"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS: comma-separated in env, e.g. "http://localhost:3000,http://localhost:3001"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> List[str]:
        if isinstance(v, list):
            return [x.strip() for x in v if x]
        s = str(v).strip()
        if not s:
            return []
        return [x.strip() for x in s.split(",") if x.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance. Use get_settings() in app."""
    return Settings()
