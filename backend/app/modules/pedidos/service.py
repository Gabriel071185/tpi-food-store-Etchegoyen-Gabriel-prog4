from app.core.time import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# RN-02: mapa de transiciones válidas. Los estados terminales no tienen salidas.
TRANSICIONES: dict[str, list[str]] = {
    "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio que responden 400."""

    def __init__(self, mensaje: str):
        super().__init__(mensaje)
        self.mensaje = mensaje


class ProductoRepetido(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class StockInsuficiente(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _existente(pedido: Pedido | None) -> Pedido:
        if not pedido:
            raise PedidoNoEncontrado()
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: se restituye en la misma transacción que cambia el estado
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto:
                producto.stock += linea.cantidad
                uow.productos.add(producto)

    def _aplicar_estado(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        # toda transición se valida antes de modificar el pedido (RN-02)
        if nuevo not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(f"Transición inválida: {pedido.estado} -> {nuevo}")
        if nuevo == "CANCELADO":
            self._restituir_stock(uow, pedido)
        pedido.estado = nuevo
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        """RN-01: todo en una transacción; si algo falla no se persiste nada."""
        ids = [i.producto_id for i in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("No se puede repetir un producto en el pedido")

        with self.uow as uow:
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0.0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(disponible: {producto.stock}, pedido: {item.cantidad})"
                    )
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            # RN-04: el cliente solo ve los propios; el admin ve todos
            usuario_id = None if usuario.role == "admin" else usuario.id
            items, total = uow.pedidos.list_by_usuario(usuario_id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow.pedidos.get_by_id(pedido_id))
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow.pedidos.get_by_id(pedido_id))
            self._aplicar_estado(uow, pedido, data.estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow.pedidos.get_by_id(pedido_id))
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._aplicar_estado(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_since(hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado("ENTREGADO"),
            )
