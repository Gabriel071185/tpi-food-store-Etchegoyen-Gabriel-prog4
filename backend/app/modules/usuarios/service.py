from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def obtener(self, usuario_id: int) -> UserPublic | None:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def cambiar_estado(self, usuario_id: int, disabled: bool, actor_id: int) -> UserPublic:
        """Activar/desactivar es idempotente: responde 200 aunque el estado no cambie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if not usuario:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            if disabled and usuario.id == actor_id:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés desactivarte a vos mismo")
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
