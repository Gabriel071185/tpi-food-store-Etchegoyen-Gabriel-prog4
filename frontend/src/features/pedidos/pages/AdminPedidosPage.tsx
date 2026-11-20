import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { formatFecha, formatPrecio } from '@/shared/utils/format'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS, TRANSICIONES } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

const TAMANO_PAGINA = 10
const SIN_DATOS: Pedido[] = []

const ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}

function esEstado(valor: string): valor is EstadoPedido {
  return ESTADOS.some((e) => e === valor)
}

export default function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)

  const { data, isLoading, isError, isPlaceholderData, refetch } = usePedidos({
    skip: pagina * TAMANO_PAGINA,
    limit: TAMANO_PAGINA,
    estado,
  })
  const cambiarEstado = useCambiarEstadoPedido()

  function cambiar(pedido: Pedido, nuevo: EstadoPedido) {
    if (nuevo === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se restituye el stock.`)) return
    cambiarEstado.mutate({ id: pedido.id, estado: nuevo })
  }

  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
    { id: 'cliente', header: 'Cliente', accessorFn: (p) => p.usuario_id, cell: ({ row }) => `Usuario #${row.original.usuario_id}` },
    { id: 'fecha', header: 'Fecha', accessorFn: (p) => p.created_at, cell: ({ row }) => formatFecha(row.original.created_at) },
    { id: 'total', header: 'Total', accessorFn: (p) => p.total, cell: ({ row }) => formatPrecio(row.original.total) },
    { id: 'estado', header: 'Estado', accessorFn: (p) => p.estado, cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variante="secundario" pequeno onClick={() => setDetalle(row.original)}>
            Detalle
          </Button>
          {TRANSICIONES[row.original.estado].map((siguiente) => (
            <Button
              key={siguiente}
              variante={siguiente === 'CANCELADO' ? 'peligro' : 'primario'}
              pequeno
              disabled={cambiarEstado.isPending}
              onClick={() => cambiar(row.original, siguiente)}
            >
              {ACCION[siguiente]}
            </Button>
          ))}
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="w-56">
          <Select
            label="Filtrar por estado"
            value={estado ?? ''}
            onChange={(e) => {
              setEstado(esEstado(e.target.value) ? e.target.value : undefined)
              setPagina(0)
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar los pedidos." onReintentar={() => void refetch()} />
      ) : (data?.items ?? SIN_DATOS).length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        data && (
          <div className={isPlaceholderData ? 'opacity-60' : ''}>
            {/* la página ya viene paginada del servidor */}
            <DataTable data={data.items} columns={columns} paginar={false} />
            <Paginacion
              pagina={pagina}
              total={data.total}
              tamano={TAMANO_PAGINA}
              onCambiar={setPagina}
              deshabilitado={isPlaceholderData}
            />
          </div>
        )
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>
    </section>
  )
}
