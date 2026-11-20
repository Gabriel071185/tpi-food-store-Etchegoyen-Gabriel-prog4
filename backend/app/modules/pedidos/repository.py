from datetime import datetime

from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(
        self, usuario_id: int | None, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        """Pedidos de un usuario (o de todos si usuario_id es None), más recientes primero."""
        stmt = select(Pedido)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        if estado:
            stmt = stmt.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(
            stmt.order_by(Pedido.created_at.desc(), Pedido.id.desc()).offset(skip).limit(limit)  # type: ignore[attr-defined]
        ).all()
        return list(items), total

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: n for estado, n in rows}

    def count_since(self, desde: datetime) -> int:
        stmt = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(stmt).one()

    def sum_total_by_estado(self, estado: str) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        return float(self.session.exec(stmt).one())
