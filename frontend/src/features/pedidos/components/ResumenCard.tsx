import { Card } from '@/shared/ui/Card'

interface Props {
  titulo: string
  valor: string | number
  detalle?: string
}

export function ResumenCard({ titulo, valor, detalle }: Props) {
  return (
    <Card>
      <p className="text-sm font-medium text-muted">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-muted">{detalle}</p>}
    </Card>
  )
}
