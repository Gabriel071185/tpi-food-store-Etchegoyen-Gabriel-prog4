from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["Productos"])

PRODUCTO_404 = "Producto no encontrado"
CATEGORIA_404 = "Categoría no encontrada"


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, PRODUCTO_404)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, CATEGORIA_404)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.actualizar(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, PRODUCTO_404)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, CATEGORIA_404)


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, PRODUCTO_404)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, PRODUCTO_404)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
