import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { mensajeError } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'

interface LocationState {
  from?: { pathname: string }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const destino = (location.state as LocationState | null)?.from?.pathname ?? '/'

  const loginMutation = useMutation({
    mutationFn: (datos: { username: string; password: string }) => login(datos.username, datos.password),
    onSuccess: () => navigate(destino, { replace: true }),
  })

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: ({ value }) => loginMutation.mutate(value),
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Iniciar sesión</h1>

        {loginMutation.isError && (
          <div role="alert" className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {handleApiError(loginMutation.error, 'No se pudo iniciar sesión')}
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <Button type="submit" disabled={loginMutation.isPending} className="mt-2 w-full">
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-brand-soft hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
