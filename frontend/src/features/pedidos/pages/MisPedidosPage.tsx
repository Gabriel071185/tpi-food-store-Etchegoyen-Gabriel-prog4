import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { formatFecha, formatPrecio } from '@/shared/utils/format'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'

const TAMANO_PAGINA = 10

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [abiertoId, setAbiertoId] = useState<number | null>(null)
  const { data, isLoading, isError, isPlaceholderData, refetch } = usePedidos({
    skip: pagina * TAMANO_PAGINA,
    limit: TAMANO_PAGINA,
  })
  const cancelar = useCancelarPedido()

  function confirmarCancelar(id: number) {
    if (window.confirm(`¿Cancelar el pedido #${id}?`)) cancelar.mutate(id)
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {isLoading ? (
        <SkeletonFilas filas={4} />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar tus pedidos." onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio
          mensaje="Todavía no hiciste ningún pedido."
          accion={
            <Link to="/" className="font-semibold text-brand-soft hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        data && (
          <>
            <div className={`space-y-3 ${isPlaceholderData ? 'opacity-60' : ''}`}>
              {data.items.map((pedido) => (
                <Card key={pedido.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Pedido #{pedido.id}</p>
                      <p className="text-sm text-muted">{formatFecha(pedido.created_at)}</p>
                    </div>
                    <BadgeEstado estado={pedido.estado} />
                    <p className="text-lg font-bold">{formatPrecio(pedido.total)}</p>
                    <div className="flex gap-2">
                      <Button
                        variante="secundario"
                        pequeno
                        onClick={() => setAbiertoId(abiertoId === pedido.id ? null : pedido.id)}
                      >
                        {abiertoId === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
                      </Button>
                      {pedido.estado === 'PENDIENTE' && (
                        <Button
                          variante="peligro"
                          pequeno
                          disabled={cancelar.isPending}
                          onClick={() => confirmarCancelar(pedido.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                  {abiertoId === pedido.id && (
                    <div className="mt-4 border-t border-line pt-4">
                      <PedidoDetalle pedido={pedido} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
            <Paginacion
              pagina={pagina}
              total={data.total}
              tamano={TAMANO_PAGINA}
              onCambiar={setPagina}
              deshabilitado={isPlaceholderData}
            />
          </>
        )
      )}
    </section>
  )
}
