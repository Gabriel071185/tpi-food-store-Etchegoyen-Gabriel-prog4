import { Button } from '@/shared/ui/Button'

interface PaginacionProps {
  /** Página actual, empezando en 0 (skip = pagina × tamaño) */
  pagina: number
  total: number
  tamano: number
  onCambiar: (pagina: number) => void
  deshabilitado?: boolean
}

export function Paginacion({ pagina, total, tamano, onCambiar, deshabilitado = false }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / tamano))

  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-muted">
        Página <strong>{pagina + 1}</strong> de <strong>{paginas}</strong> · {total} resultados
      </span>
      <div className="flex gap-2">
        <Button
          variante="secundario"
          pequeno
          disabled={deshabilitado || pagina === 0}
          onClick={() => onCambiar(pagina - 1)}
        >
          Anterior
        </Button>
        <Button
          variante="secundario"
          pequeno
          disabled={deshabilitado || pagina + 1 >= paginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
