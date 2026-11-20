import { useEffect } from 'react'
import { useNotificationStore } from '@/store/notificationStore'

export function Toast() {
  const mensaje = useNotificationStore((s) => s.mensaje)
  const ocultar = useNotificationStore((s) => s.ocultar)

  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(ocultar, 3500)
    return () => clearTimeout(timer)
  }, [mensaje, ocultar])

  if (!mensaje) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[9999] max-w-sm rounded-xl border border-line border-l-4 border-l-brand bg-surface-2 px-4 py-3 text-sm text-ink shadow-2xl"
    >
      {mensaje}
    </div>
  )
}
