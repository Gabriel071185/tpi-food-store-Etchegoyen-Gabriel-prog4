import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/features/auth/types/auth'
import { Skeleton } from '@/shared/components/Skeleton'
import { useAuthStore } from '@/store/authStore'

interface Props {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // mientras checkSession confirma la sesión con el backend
  if (cargando) {
    return (
      <div className="space-y-3" role="status" aria-label="Verificando sesión">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />

  // la protección real está en el backend (require_role); esto solo evita mostrar pantallas inútiles
  if (allowedRoles && !allowedRoles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}
