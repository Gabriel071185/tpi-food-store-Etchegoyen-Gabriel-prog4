from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre sin distinguir mayúsculas, incluyendo las dadas de baja."""
        stmt = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(stmt).first()

    def list_activas(self) -> list[Categoria]:
        stmt = select(Categoria).where(Categoria.activo == True)  # noqa: E712
        return list(self.session.exec(stmt).all())
