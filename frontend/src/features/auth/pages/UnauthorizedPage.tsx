import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8 text-center">
        <h1 className="mb-3 text-3xl font-bold text-red-400">Acceso denegado</h1>
        <p className="mb-6 text-muted">No tenés los permisos necesarios para ver esta página.</p>
        <Link to="/" className="font-semibold text-brand-soft hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  )
}
