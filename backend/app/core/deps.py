from fastapi import Depends, HTTPException, Request, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(request: Request) -> UserPublic:
    """Lee el JWT de la cookie access_token. 401 si falta, es inválido o venció."""
    token = request.cookies.get("access_token")
    payload = decode_access_token(token) if token else None
    sub = payload.get("sub") if payload else None
    if not sub or not str(sub).isdigit():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    usuario = UsuarioService(UsuarioUnitOfWork()).obtener(int(sub))
    if not usuario:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    return usuario


def get_current_active_user(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return user


def require_role(allowed_roles: list[str]):
    def checker(user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if user.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Permisos insuficientes")
        return user

    return checker
