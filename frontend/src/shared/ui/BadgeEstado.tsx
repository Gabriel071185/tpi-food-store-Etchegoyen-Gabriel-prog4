import type { EstadoPedido } from '@/features/pedidos/types/pedido'

const ESTILOS: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-yellow-500/15 text-yellow-300',
  EN_PREPARACION: 'bg-blue-500/15 text-blue-300',
  ENTREGADO: 'bg-green-500/15 text-green-300',
  CANCELADO: 'bg-red-500/15 text-red-300',
}

const ETIQUETAS: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILOS[estado]}`}>
      {ETIQUETAS[estado]}
    </span>
  )
}
