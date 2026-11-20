import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje?: string
  accion?: ReactNode
}

export function EstadoVacio({ mensaje = 'No hay datos para mostrar.', accion }: EstadoVacioProps) {
  return (
    <div className="my-4 rounded-lg border border-line bg-surface py-12 text-center shadow-sm">
      <p className="mb-4 text-muted">{mensaje}</p>
      {accion}
    </div>
  )
}
