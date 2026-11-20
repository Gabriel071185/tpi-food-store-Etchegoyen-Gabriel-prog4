from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados. Devuelve (items de la página, total)."""
        stmt = select(Producto).where(Producto.activo == True)  # noqa: E712
        if search:
            stmt = stmt.where(func.lower(Producto.nombre).contains(search.lower()))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(stmt.order_by(Producto.id).offset(skip).limit(limit)).all()  # type: ignore[arg-type]
        return list(items), total
