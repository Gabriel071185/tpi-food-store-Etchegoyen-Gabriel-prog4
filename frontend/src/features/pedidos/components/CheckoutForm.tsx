import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '@/shared/api/handleApiError'
import { formatPrecio, mensajeError } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input, Select, Textarea } from '@/shared/ui/Input'
import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'

export function CheckoutForm() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      crearPedido.mutate(
        {
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        },
        {
          onSuccess: () => {
            vaciar()
            useNotificationStore.getState().mostrar('¡Pedido confirmado!')
            navigate('/mis-pedidos')
          },
        },
      ),
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Datos de entrega</h2>

        {crearPedido.isError && (
          <div role="alert" className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {handleApiError(crearPedido.error, 'No se pudo confirmar el pedido')}
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) => {
                const largo = value.trim().length
                return largo >= 5 && largo <= 200 ? undefined : 'La dirección debe tener entre 5 y 200 caracteres'
              },
            }}
          >
            {(field) => (
              <Input
                label="Dirección de entrega"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <Select
                label="Forma de pago"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO')}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </Select>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <Textarea
                label="Notas (opcional)"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>

          <Button type="submit" disabled={crearPedido.isPending} className="mt-2">
            {crearPedido.isPending ? 'Confirmando...' : 'Confirmar pedido'}
          </Button>
        </form>
      </Card>

      <Card className="h-fit">
        <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
        <ul className="divide-y divide-line text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between gap-2 py-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatPrecio(i.cantidad * i.precio_unitario)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrecio(total)}</span>
        </p>
      </Card>
    </div>
  )
}
