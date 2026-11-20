from typing import Generic, Type, TypeVar

from sqlmodel import Session, select

T = TypeVar("T")


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()  # INSERT sin commit; el commit lo hace el UnitOfWork
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()
