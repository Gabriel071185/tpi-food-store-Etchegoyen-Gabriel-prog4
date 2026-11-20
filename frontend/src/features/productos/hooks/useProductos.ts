import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate } from '../types/producto'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // evita parpadeos al paginar
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['productos'] })
}

function notificarError(error: unknown, mensaje: string): void {
  useNotificationStore.getState().mostrar(handleApiError(error, mensaje))
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      void invalidar()
      useNotificationStore.getState().mostrar('Producto creado')
    },
    onError: (error) => notificarError(error, 'No se pudo crear el producto'),
  })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoCreate }) => actualizarProducto(id, datos),
    onSuccess: () => {
      void invalidar()
      useNotificationStore.getState().mostrar('Producto actualizado')
    },
    onError: (error) => notificarError(error, 'No se pudo actualizar el producto'),
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => actualizarStock(id, datos),
    onSuccess: () => {
      void invalidar()
      useNotificationStore.getState().mostrar('Stock actualizado')
    },
    onError: (error) => notificarError(error, 'No se pudo actualizar el stock'),
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      void invalidar()
      useNotificationStore.getState().mostrar('Producto eliminado')
    },
    onError: (error) => notificarError(error, 'No se pudo eliminar el producto'),
  })
}
