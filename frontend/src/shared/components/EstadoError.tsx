import { Button } from '@/shared/ui/Button'

interface EstadoErrorProps {
  mensaje?: string
  onReintentar?: () => void
}

export function EstadoError({
  mensaje = 'Ocurrió un error al cargar los datos.',
  onReintentar,
}: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="my-4 flex flex-col items-center gap-4 rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-300"
    >
      <p className="font-medium">{mensaje}</p>
      {onReintentar && (
        <Button variante="peligro" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
