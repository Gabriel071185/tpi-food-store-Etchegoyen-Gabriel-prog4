import axios, { isAxiosError } from 'axios'

let onSessionExpired: (() => void) | null = null

/** El authStore registra aquí cómo limpiar la sesión (evita un import circular). */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const url = error.config?.url ?? ''
      const status = error.response?.status
      const data = error.response?.data as { detail?: unknown } | undefined

      // 401 fuera de /auth/token y /auth/me: la sesión venció o no existe
      const sesionVencida =
        status === 401 && !url.includes('/auth/token') && !url.includes('/auth/me')
      // 400 «Cuenta de usuario desactivada» en cualquier endpoint con sesión
      const cuentaDesactivada =
        status === 400 && data?.detail === CUENTA_DESACTIVADA && !url.includes('/auth/token')

      if (sesionVencida || cuentaDesactivada) onSessionExpired?.()
    }
    return Promise.reject(error)
  },
)
