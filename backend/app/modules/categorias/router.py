from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["Categorías"])

NO_ENCONTRADA = "Categoría no encontrada"
DUPLICADA = "Ya existe una categoría con ese nombre"


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_ENCONTRADA)


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.crear(data)
    except NombreDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICADA)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_ENCONTRADA)
    except NombreDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICADA)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_ENCONTRADA)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
