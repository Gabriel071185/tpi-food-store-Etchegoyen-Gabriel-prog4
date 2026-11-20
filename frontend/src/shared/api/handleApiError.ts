import { isAxiosError } from 'axios'

interface ErrorDetalle {
  msg: string
}

function esErrorDetalle(valor: unknown): valor is ErrorDetalle {
  return typeof valor === 'object' && valor !== null && 'msg' in valor && typeof valor.msg === 'string'
}

/** Convierte el `detail` de la API (string o lista de errores 422) en un mensaje para la pantalla. */
export function handleApiError(error: unknown, mensajePorDefecto: string): string {
  if (!isAxiosError(error)) return mensajePorDefecto
  if (!error.response) return 'No se pudo conectar con el servidor'

  const data = error.response.data as { detail?: unknown } | undefined
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const mensajes = detail.filter(esErrorDetalle).map((d) => d.msg)
    if (mensajes.length > 0) return mensajes.join('. ')
  }
  return mensajePorDefecto
}
