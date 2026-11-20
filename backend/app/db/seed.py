"""Carga datos iniciales. Idempotente: se puede ejecutar varias veces.

Uso: python -m app.db.seed
"""
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.db import base  # noqa: F401
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para cerrar"),
]

def _foto(photo_id: str) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=600&q=70"


# (categoria, nombre, descripcion, precio, stock, imagen_url)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y queso", 6500.0, 30, _foto("1568901346375-23c9450c58cd")),
    ("Hamburguesas", "Hamburguesa doble", "Doble carne y cheddar", 8200.0, 25, _foto("1553979459-d2229ba7433b")),
    ("Hamburguesas", "Hamburguesa vegetariana", "Medallón de lentejas", 6900.0, 15, _foto("1520072959219-c595dc870360")),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate y muzzarella", 7800.0, 20, _foto("1513104890138-7c749659a591")),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate y ajo", 8600.0, 20, _foto("1574071318508-1cdbab80d002")),
    ("Bebidas", "Gaseosa 500 ml", "Cola, lima-limón o naranja", 1800.0, 60, _foto("1622483767028-3f66f32aef97")),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1200.0, 80, _foto("1548839140-29a749e1cf4d")),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3200.0, 18, _foto("1488477181946-6428a0291777")),
]


def run() -> None:
    create_all_tables()
    with session_factory() as session:
        if not session.exec(select(Usuario).where(Usuario.username == "admin")).first():
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if not cat:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
            categorias[nombre] = cat
        session.flush()

        for cat_nombre, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if not existe:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id,  # type: ignore[arg-type]
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=imagen,
                    )
                )
            elif not existe.imagen_url:
                # completa la imagen de productos ya cargados sin pisar las que editó el admin
                existe.imagen_url = imagen
                session.add(existe)
        session.commit()
    print("Seed completo. Admin: admin / Admin1234!")


if __name__ == "__main__":
    run()
