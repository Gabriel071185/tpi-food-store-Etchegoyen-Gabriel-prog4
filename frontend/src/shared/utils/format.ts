const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

export function formatPrecio(valor: number): string {
  return formatoPrecio.format(valor)
}

export function formatFecha(iso: string): string {
  // el backend devuelve fechas UTC sin zona horaria
  const fecha = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

/** Une los errores de un campo de TanStack Form (validadores que devuelven string). */
export function mensajeError(errores: ReadonlyArray<unknown>): string | undefined {
  const textos = errores.filter((e): e is string => typeof e === 'string')
  return textos.length > 0 ? textos.join(', ') : undefined
}
