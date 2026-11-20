from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _http(error: Exception) -> HTTPException:
    """Traduce las excepciones de dominio a HTTPException."""
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        detalle = "Pedido no encontrado" if isinstance(error, PedidoNoEncontrado) else "Producto no encontrado"
        return HTTPException(status.HTTP_404_NOT_FOUND, detalle)
    if isinstance(error, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, "El pedido pertenece a otro usuario")
    if isinstance(error, ReglaDeNegocio):
        return HTTPException(status.HTTP_400_BAD_REQUEST, error.mensaje)
    raise error


ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    user: UserPublic = Depends(get_current_active_user),
):
    try:
        return service.crear(user.id, data)
    except ERRORES as e:
        raise _http(e)


@router.get("", response_model=PedidosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    service: PedidoService = Depends(get_pedido_service),
    user: UserPublic = Depends(get_current_active_user),
):
    return service.listar(user, estado, skip, limit)


# Debe declararse antes de /{pedido_id} para que "resumen" no se interprete como id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen(
    service: PedidoService = Depends(get_pedido_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener(
    pedido_id: int,
    service: PedidoService = Depends(get_pedido_service),
    user: UserPublic = Depends(get_current_active_user),
):
    try:
        return service.obtener(pedido_id, user)
    except ERRORES as e:
        raise _http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.cambiar_estado(pedido_id, data)
    except ERRORES as e:
        raise _http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(
    pedido_id: int,
    service: PedidoService = Depends(get_pedido_service),
    user: UserPublic = Depends(get_current_active_user),
):
    try:
        return service.cancelar(pedido_id, user)
    except ERRORES as e:
        raise _http(e)
