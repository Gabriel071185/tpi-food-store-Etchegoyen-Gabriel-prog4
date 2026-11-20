from sqlmodel import Field, Relationship, SQLModel


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: str | None = Field(default=None)
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")  # noqa: F821
