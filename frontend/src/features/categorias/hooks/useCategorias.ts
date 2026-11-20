import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias'
import type { CategoriaCreate } from '../types/categoria'

const KEY = ['categorias']

export function useCategorias() {
  return useQuery({ queryKey: KEY, queryFn: getCategorias })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
      useNotificationStore.getState().mostrar('Categoría creada')
    },
    onError: (error) => useNotificationStore.getState().mostrar(handleApiError(error, 'No se pudo crear la categoría')),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaCreate }) => actualizarCategoria(id, datos),
    onSuccess: () => {
      // los productos muestran el nombre de su categoría
      void queryClient.invalidateQueries({ queryKey: KEY })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
      useNotificationStore.getState().mostrar('Categoría actualizada')
    },
    onError: (error) =>
      useNotificationStore.getState().mostrar(handleApiError(error, 'No se pudo actualizar la categoría')),
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
      useNotificationStore.getState().mostrar('Categoría eliminada')
    },
    onError: (error) =>
      useNotificationStore.getState().mostrar(handleApiError(error, 'No se pudo eliminar la categoría')),
  })
}
