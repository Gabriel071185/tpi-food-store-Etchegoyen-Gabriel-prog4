import { useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonCard } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Input, Select } from '@/shared/ui/Input'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const TAMANO_PAGINA = 8

export default function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [pagina, setPagina] = useState(0)

  const search = useDebouncedValue(busqueda.trim(), 400)
  const { data: categorias = [] } = useCategorias()

  // paginación en el servidor: skip = página × limit
  const { data, isLoading, isError, isPlaceholderData, refetch } = useProductos({
    skip: pagina * TAMANO_PAGINA,
    limit: TAMANO_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  function limpiar() {
    setBusqueda('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  return (
    <section>
      <div className="mb-8 overflow-hidden rounded-3xl border border-line bg-linear-to-br from-brand-strong/30 via-surface to-surface p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-soft">Food Store</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">¿Qué vas a pedir hoy?</h1>
        <p className="mt-2 max-w-xl text-muted">
          Elegí tus platos favoritos, armá tu carrito y confirmá el pedido en un minuto.
        </p>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[1fr_16rem_auto] sm:items-end">
        <Input
          label="Buscar"
          type="search"
          placeholder="Nombre del producto..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />
        <Select
          label="Categoría"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(0)
          }}
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
        <Button variante="secundario" onClick={limpiar}>
          Limpiar filtros
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: TAMANO_PAGINA }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje="No se pudo cargar el catálogo." onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio
          mensaje="No encontramos productos con esos filtros."
          accion={
            <Button variante="secundario" onClick={limpiar}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        data && (
          <>
            <div
              className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? 'opacity-60' : ''}`}
            >
              {data.items.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
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
