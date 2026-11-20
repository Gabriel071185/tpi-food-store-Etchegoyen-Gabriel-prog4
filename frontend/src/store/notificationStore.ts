import { create } from 'zustand'

interface NotificationState {
  mensaje: string | null
  mostrar: (mensaje: string) => void
  ocultar: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  mensaje: null,
  mostrar: (mensaje) => set({ mensaje }),
  ocultar: () => set({ mensaje: null }),
}))
