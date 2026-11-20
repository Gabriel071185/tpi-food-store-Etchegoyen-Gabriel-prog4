export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-surface-3 ${className}`} />
}

/** Esqueleto de una tarjeta de producto, para el catálogo mientras carga. */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-sm" aria-busy="true">
      <Skeleton className="mb-3 h-36 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
