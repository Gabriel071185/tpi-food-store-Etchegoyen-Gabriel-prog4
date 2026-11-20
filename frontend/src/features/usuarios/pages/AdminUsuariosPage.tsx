import type { ColumnDef } from '@tanstack/react-table'
import type { Usuario } from '@/features/auth/types/auth'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'

const SIN_DATOS: Usuario[] = []

export default function AdminUsuariosPage() {
  const { data, isLoading, isError, refetch } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()
  const usuarioActual = useAuthStore((s) => s.usuario)

  const columns: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-300">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const u = row.original
        if (u.disabled) {
          return (
            <Button
              pequeno
              disabled={cambiarEstado.isPending}
              onClick={() => cambiarEstado.mutate({ id: u.id, activar: true })}
            >
              Activar
            </Button>
          )
        }
        // el admin no puede desactivarse a sí mismo
        if (u.id === usuarioActual?.id) return <span className="text-xs text-muted">Tu cuenta</span>
        return (
          <Button
            variante="peligro"
            pequeno
            disabled={cambiarEstado.isPending}
            onClick={() => cambiarEstado.mutate({ id: u.id, activar: false })}
          >
            Desactivar
          </Button>
        )
      },
    },
  ]

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Usuarios</h1>
      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar los usuarios." onReintentar={() => void refetch()} />
      ) : (data ?? SIN_DATOS).length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios." />
      ) : (
        <DataTable data={data ?? SIN_DATOS} columns={columns} />
      )}
    </section>
  )
}
