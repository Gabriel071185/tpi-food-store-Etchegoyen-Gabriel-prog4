import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { formatPrecio } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { StockModal } from '../components/StockModal'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto } from '../types/producto'

const SIN_DATOS: Producto[] = []

export default function AdminProductosPage() {
  // el panel pide limit=100 y pagina del lado del cliente con TanStack Table
  const { data, isLoading, isError, refetch } = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [stockDe, setStockDe] = useState<Producto | null>(null)

  function abrirForm(producto: Producto | null) {
    setEditando(producto)
    setFormAbierto(true)
  }

  function confirmarEliminar(producto: Producto) {
    if (window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) eliminar.mutate(producto.id)
  }

  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
    { id: 'precio', header: 'Precio', accessorFn: (p) => p.precio_base, cell: ({ row }) => formatPrecio(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    {
      id: 'disponible',
      header: 'Disponible',
      accessorFn: (p) => (p.disponible ? 'Sí' : 'No'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variante="texto" pequeno onClick={() => abrirForm(row.original)}>
            Editar
          </Button>
          <Button variante="secundario" pequeno onClick={() => setStockDe(row.original)}>
            Stock
          </Button>
          <Button variante="peligro" pequeno onClick={() => confirmarEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const productos = data?.items ?? SIN_DATOS

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => abrirForm(null)}>+ Nuevo producto</Button>
      </div>

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No se pudieron cargar los productos." onReintentar={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos." />
      ) : (
        <DataTable data={productos} columns={columns} tamanoPagina={10} />
      )}

      <ProductoFormModal abierto={formAbierto} producto={editando} onCerrar={() => setFormAbierto(false)} />
      <StockModal producto={stockDe} onCerrar={() => setStockDe(null)} />
    </section>
  )
}
