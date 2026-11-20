from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.core.time import utcnow


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="PENDIENTE")
    forma_pago: str  # "EFECTIVO" | "TRANSFERENCIA"
    direccion_entrega: str
    notas: str | None = Field(default=None)
    total: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    usuario: "Usuario" = Relationship(back_populates="pedidos")  # noqa: F821
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre_producto: str  # copia del producto al crear el pedido (RN-05)
    precio_unitario: float  # copia del precio al crear el pedido (RN-05)
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")  # noqa: F821
