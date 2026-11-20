from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha UTC sin tzinfo (compatible con SQLite y PostgreSQL)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
