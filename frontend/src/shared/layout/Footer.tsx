export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-strong text-sm">🍽️</span>
          <span>
            Food<span className="text-brand">Store</span>
          </span>
        </p>
        <p className="mt-2 max-w-md text-sm text-muted">
          Pedí tus platos favoritos desde el celular o la computadora y seguí el estado de tu pedido.
        </p>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted">
          Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia · UTN
        </p>
      </div>
    </footer>
  )
}
