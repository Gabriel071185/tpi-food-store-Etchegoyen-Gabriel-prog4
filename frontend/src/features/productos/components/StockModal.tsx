import { useForm } from '@tanstack/react-form'
import { mensajeError } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { useActualizarStock } from '../hooks/useProductos'
import type { Producto } from '../types/producto'

interface Props {
  producto: Producto | null
  onCerrar: () => void
}

export function StockModal({ producto, onCerrar }: Props) {
  return (
    <Modal abierto={producto !== null} titulo={`Stock: ${producto?.nombre ?? ''}`} onCerrar={onCerrar}>
      {producto && <StockForm producto={producto} onCerrar={onCerrar} />}
    </Modal>
  )
}

function StockForm({ producto, onCerrar }: { producto: Producto; onCerrar: () => void }) {
  const actualizar = useActualizarStock()

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => actualizar.mutate({ id: producto.id, datos: value }, { onSuccess: onCerrar }),
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isInteger(value) && value >= 0 ? undefined : 'Debe ser un entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <Input
            label="Stock"
            type="number"
            min={0}
            step={1}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCerrar} disabled={actualizar.isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={actualizar.isPending}>
          {actualizar.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
