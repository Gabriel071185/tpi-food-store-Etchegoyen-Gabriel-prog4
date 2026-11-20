import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'

const KEY = ['usuarios']

export function useUsuarios() {
  return useQuery({ queryKey: KEY, queryFn: getUsuarios })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? activarUsuario(id) : desactivarUsuario(id),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: KEY })
      useNotificationStore.getState().mostrar(`Usuario ${usuario.disabled ? 'desactivado' : 'activado'}`)
    },
    onError: (error) =>
      useNotificationStore.getState().mostrar(handleApiError(error, 'No se pudo cambiar el estado del usuario')),
  })
}
