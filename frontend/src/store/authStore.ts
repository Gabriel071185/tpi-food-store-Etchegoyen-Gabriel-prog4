import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMe, loginRequest, logoutRequest } from '@/features/auth/api/auth'
import type { Role, Usuario } from '@/features/auth/types/auth'
import { setSessionExpiredHandler } from '@/shared/api/axiosInstance'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password)
        const usuario = await getMe()
        set({ usuario, cargando: false })
      },

      logout: async () => {
        try {
          await logoutRequest()
        } finally {
          set({ usuario: null })
        }
      },

      // Confirma con el backend si la cookie sigue vigente (se llama al montar la app)
      checkSession: async () => {
        try {
          const usuario = await getMe()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      hasRole: (...roles) => {
        const usuario = get().usuario
        return usuario !== null && roles.includes(usuario.role)
      },
    }),
    {
      name: 'auth-storage',
      // Solo se guarda el usuario; el token vive en la cookie HttpOnly y nunca llega al frontend
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

setSessionExpiredHandler(() => useAuthStore.setState({ usuario: null }))
