"""Importa todos los modelos para registrarlos en SQLModel.metadata y resolver las relaciones."""
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.usuarios.models import Usuario  # noqa: F401
