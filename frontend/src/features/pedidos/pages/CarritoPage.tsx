import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { formatPrecio } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useCartStore } from '@/store/cartStore'

export default function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-6 text-2xl font-bold">Carrito</h1>
        <EstadoVacio
          mensaje="Tu carrito está vacío."
          accion={
            <Link to="/" className="font-semibold text-brand-soft hover:underline">
              Ver el catálogo
            </Link>
          }
        />
      </section>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carrito</h1>
        <Button variante="texto" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.producto_id} className="flex flex-wrap items-center gap-4">
            {item.imagen_url ? (
              <img src={item.imagen_url} alt={item.nombre} className="h-16 w-16 rounded object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-surface-2 text-2xl">🍽️</div>
            )}

            <div className="min-w-40 flex-1">
              <p className="font-semibold">{item.nombre}</p>
              <p className="text-sm text-muted">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variante="secundario"
                pequeno
                aria-label="Restar uno"
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center font-medium">{item.cantidad}</span>
              <Button
                variante="secundario"
                pequeno
                aria-label="Sumar uno"
                disabled={item.cantidad >= item.stock}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>

            <p className="w-28 text-right font-bold">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button variante="peligro" pequeno onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xl font-bold">Total: {formatPrecio(total)}</p>
        <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
      </Card>
    </section>
  )
}
