import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'
import { formatPrecio } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  // si la URL de la imagen falla, se muestra el ícono de reemplazo
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = !producto.disponible || producto.stock < 1
  const limiteAlcanzado = enCarrito >= producto.stock

  function agregarAlCarrito() {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
      imagen_url: producto.imagen_url,
    })
    useNotificationStore.getState().mostrar(`"${producto.nombre}" agregado al carrito`)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-brand/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              sinStock ? 'grayscale' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-canvas/80 px-2.5 py-1 text-xs font-semibold text-brand-soft backdrop-blur">
          {producto.categoria.nombre}
        </span>
        {sinStock && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold leading-tight">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-muted">{producto.descripcion}</p>}

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-brand-soft">{formatPrecio(producto.precio_base)}</span>
            {!sinStock && <span className="text-xs text-muted">Stock: {producto.stock}</span>}
          </div>
          <Button className="w-full" disabled={sinStock || limiteAlcanzado} onClick={agregarAlCarrito}>
            {limiteAlcanzado && !sinStock ? 'Máximo en el carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </article>
  )
}
