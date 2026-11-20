import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // única llamada a la API dentro de un useEffect: confirma la sesión al montar la app
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
