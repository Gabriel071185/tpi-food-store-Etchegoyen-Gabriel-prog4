from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    _: UserPublic = Depends(require_role(["admin"])),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    admin: UserPublic = Depends(require_role(["admin"])),
):
    return service.cambiar_estado(usuario_id, disabled=False, actor_id=admin.id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    admin: UserPublic = Depends(require_role(["admin"])),
):
    return service.cambiar_estado(usuario_id, disabled=True, actor_id=admin.id)
