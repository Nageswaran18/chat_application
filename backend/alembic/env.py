"""
Alembic env. Run from backend: alembic upgrade head / alembic revision --autogenerate
"""
import sys
from pathlib import Path

# Add backend root so "app" package is importable
backend_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_root))

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy.pool import NullPool
from alembic import context
from app.db.database import Base, DATABASE_URL
from app.models.user import User  # noqa: F401 - register model with Base
from app.models.message import Message  # noqa: F401 - register model with Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Use app's DATABASE_URL so one source of truth
config.set_main_option("sqlalchemy.url", DATABASE_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generate SQL only)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connect to DB)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
