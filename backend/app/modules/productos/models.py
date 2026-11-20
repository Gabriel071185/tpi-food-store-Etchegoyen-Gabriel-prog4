from sqlmodel import Field, Relationship, SQLModel


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str
    descripcion: str | None = Field(default=None)
    precio_base: float
    imagen_url: str | None = Field(default=None)
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: "Categoria" = Relationship(back_populates="productos")  # noqa: F821
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")  # noqa: F821
