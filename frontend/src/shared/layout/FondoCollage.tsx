const FOTOS = Array.from({ length: 10 }, (_, i) => `/fondo/comida-${String(i + 1).padStart(2, '0')}.jpg`)
const CANTIDAD = 63 // alcanza para cubrir pantallas altas y angostas

// Orden fijo que evita repetir la misma foto en baldosas contiguas
const BALDOSAS = Array.from({ length: CANTIDAD }, (_, i) => FOTOS[(i * 3 + Math.floor(i / 6)) % FOTOS.length])

interface Props {
  /** En el panel de administración el fondo se atenúa más para no distraer de las tablas. */
  tenue?: boolean
}

/** Collage de comidas fijo detrás de todo el contenido, cubierto por una capa oscura. */
export function FondoCollage({ tenue = false }: Props) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas">
      <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-7">
        {BALDOSAS.map((src, i) => (
          <img key={i} src={src} alt="" className="aspect-square w-full object-cover" />
        ))}
      </div>
      <div
        className={`absolute inset-0 backdrop-blur-[2px] ${
          tenue ? 'bg-canvas/90' : 'bg-canvas/70'
        } bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(12_12_16/0.65)_100%)]`}
      />
    </div>
  )
}
