from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; commit/rollback y close en __exit__."""

    def __init__(self, factory: Callable[[], Session] = session_factory):
        self._factory = factory
        self.session: Session

    def __enter__(self):
        self.session = self._factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
