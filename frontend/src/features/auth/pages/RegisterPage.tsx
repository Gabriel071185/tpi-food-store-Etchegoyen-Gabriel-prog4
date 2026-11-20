import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { mensajeError } from '@/shared/utils/format'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { registerRequest } from '../api/auth'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)

  const registro = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      useNotificationStore.getState().mostrar('Cuenta creada. Ya podés iniciar sesión.')
      navigate('/login')
    },
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: ({ value }) => registro.mutate(value),
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Crear cuenta</h1>

        {registro.isError && (
          <div role="alert" className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {handleApiError(registro.error, 'No se pudo crear la cuenta')}
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
            validators={{
              onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres'),
            }}
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
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (EMAIL_VALIDO.test(value) ? undefined : 'Ingresá un email válido'),
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={mensajeError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <Button type="submit" disabled={registro.isPending} className="mt-2 w-full">
            {registro.isPending ? 'Creando cuenta...' : 'Registrarme'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-soft hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
