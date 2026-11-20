import { useForm } from '@tanstack/react-form'
import { handleApiError } from '@/shared/api/handleApiError'
import { mensajeError } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Input, Textarea } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { useActualizarCategoria, useCrearCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'

interface Props {
  abierto: boolean
  categoria: Categoria | null
  onCerrar: () => void
}

export function CategoriaFormModal({ abierto, categoria, onCerrar }: Props) {
  return (
    <Modal abierto={abierto} titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCerrar}>
      {/* el formulario se monta al abrir, así siempre arranca con los valores correctos */}
      <CategoriaForm categoria={categoria} onCerrar={onCerrar} />
    </Modal>
  )
}

function CategoriaForm({ categoria, onCerrar }: { categoria: Categoria | null; onCerrar: () => void }) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const mutation = categoria ? actualizar : crear

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: ({ value }) => {
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }
      if (categoria) {
        actualizar.mutate({ id: categoria.id, datos }, { onSuccess: onCerrar })
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
          {handleApiError(mutation.error, 'No se pudo guardar la categoría')}
        </div>
      )}

      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo >= 2 && largo <= 100 ? undefined : 'El nombre debe tener entre 2 y 100 caracteres'
          },
        }}
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
