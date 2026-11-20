import { useForm } from '@tanstack/react-form'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { mensajeError } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Input, Select, Textarea } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { useActualizarProducto, useCrearProducto } from '../hooks/useProductos'
import type { Producto } from '../types/producto'

interface Props {
  abierto: boolean
  producto: Producto | null
  onCerrar: () => void
}

export function ProductoFormModal({ abierto, producto, onCerrar }: Props) {
  return (
    <Modal abierto={abierto} titulo={producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={onCerrar}>
      <ProductoForm producto={producto} onCerrar={onCerrar} />
    </Modal>
  )
}

function ProductoForm({ producto, onCerrar }: { producto: Producto | null; onCerrar: () => void }) {
  const { data: categorias = [] } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const mutation = producto ? actualizar : crear

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: ({ value }) => {
      const datos = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      }
      if (producto) {
        actualizar.mutate({ id: producto.id, datos }, { onSuccess: onCerrar })
      } else {
        crear.mutate(datos, { onSuccess: onCerrar })
      }
    },
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
      {mutation.isError && (
        <div role="alert" className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {handleApiError(mutation.error, 'No se pudo guardar el producto')}
        </div>
      )}

      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            label="Descripción"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Select
            label="Categoría"
            value={field.state.value}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors)}
          >
            <option value={0}>Seleccionar...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (value >= 0 ? undefined : 'No puede ser negativo') }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta.errors)}
            />
          )}
        </form.Field>

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
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen"
            type="url"
            placeholder="https://..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
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

      <div className="mt-2 flex justify-end gap-2">
        <Button variante="secundario" onClick={onCerrar} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
