import { Navigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'

export default function CheckoutPage() {
  const hayItems = useCartStore((s) => s.items.length > 0)

  if (!hayItems) return <Navigate to="/carrito" replace />

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
      <CheckoutForm />
    </section>
  )
}
