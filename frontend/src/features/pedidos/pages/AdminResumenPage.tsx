import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatPrecio } from '@/shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export default function AdminResumenPage() {
  const { data, isLoading, isError, refetch } = useResumenPedidos()

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Resumen del negocio</h1>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError || !data ? (
        <EstadoError mensaje="No se pudo cargar el resumen." onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={data.pendientes} />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} />
          <ResumenCard titulo="Entregados" valor={data.entregados} />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={formatPrecio(data.ingresos_entregados)}
            detalle="Suma de los pedidos ENTREGADO"
          />
        </div>
      )}
    </section>
  )
}
