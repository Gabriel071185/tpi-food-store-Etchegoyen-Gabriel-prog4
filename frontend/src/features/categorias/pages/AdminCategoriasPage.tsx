import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria'

const SIN_DATOS: Categoria[] = []

export default function AdminCategoriasPage() {
  const { data, isLoading, isError, refetch } = useCategorias()
  const eliminar = useEliminarCategoria()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)

  function abrir(categoria: Categoria | null) {
    setEditando(categoria)
    setModalAbierto(true)
  }

  function confirmarEliminar(categoria: Categoria) {
    if (window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) eliminar.mutate(categoria.id)
  }

  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variante="texto" pequeno onClick={() => abrir(row.original)}>
            Editar
          </Button>
          <Button variante="peligro" pequeno onClick={() => confirmarEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
      </div>

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar las categorías." onReintentar={() => void refetch()} />
      ) : (data ?? SIN_DATOS).length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías." />
      ) : (
        <DataTable data={data ?? SIN_DATOS} columns={columns} tamanoPagina={10} />
      )}

      <CategoriaFormModal abierto={modalAbierto} categoria={editando} onCerrar={() => setModalAbierto(false)} />
    </section>
  )
}
