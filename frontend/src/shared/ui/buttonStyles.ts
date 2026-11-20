export type Variante = 'primario' | 'secundario' | 'contorno' | 'peligro' | 'texto'

const BASE =
  'inline-flex cursor-pointer select-none items-center justify-center rounded-lg font-semibold transition duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40'

// `not-disabled:` hace que los efectos de hover también funcionen en <a> y no se activen en botones deshabilitados.
const ELEVAR = 'not-disabled:hover:-translate-y-0.5'

const ESTILOS: Record<Variante, string> = {
  primario: `bg-brand-strong text-white shadow-md shadow-brand/20 ${ELEVAR} not-disabled:hover:shadow-lg not-disabled:hover:shadow-brand/40 not-disabled:hover:ring-2 not-disabled:hover:ring-brand/70`,
  secundario: `bg-surface-3 text-ink ${ELEVAR} not-disabled:hover:bg-line not-disabled:hover:ring-1 not-disabled:hover:ring-brand/60`,
  contorno: `border border-line text-ink ${ELEVAR} not-disabled:hover:border-brand not-disabled:hover:bg-brand/10 not-disabled:hover:text-brand-soft`,
  peligro: `bg-red-600 text-white shadow-md shadow-red-600/20 ${ELEVAR} not-disabled:hover:bg-red-700 not-disabled:hover:shadow-lg not-disabled:hover:shadow-red-600/40`,
  texto: 'text-brand-soft not-disabled:hover:bg-brand/15',
}

/** Clases de un botón; sirve tanto para <button> como para <Link> con aspecto de botón. */
export function clasesBoton(variante: Variante = 'primario', pequeno = false): string {
  const tamano = pequeno ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
  return `${BASE} ${tamano} ${ESTILOS[variante]}`
}
