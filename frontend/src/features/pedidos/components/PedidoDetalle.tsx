import { formatFecha, formatPrecio } from '@/shared/utils/format'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import type { Pedido } from '../types/pedido'

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-muted">Creado: {formatFecha(pedido.created_at)}</span>
        <span className="text-muted">Actualizado: {formatFecha(pedido.updated_at)}</span>
      </div>

      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted">Dirección de entrega</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted">Forma de pago</dt>
          <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="min-w-full divide-y divide-line">
        <thead>
          <tr className="text-left text-xs uppercase text-muted">
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={3} className="pt-3 text-right">
              Total
            </td>
            <td className="pt-3 text-right">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
