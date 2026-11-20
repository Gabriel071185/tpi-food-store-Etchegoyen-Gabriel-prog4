import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleApiError } from '@/shared/api/handleApiError'
import { useNotificationStore } from '@/store/notificationStore'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: getResumenPedidos })
}

/** Los pedidos modifican el stock: se invalidan también los productos. */
function useInvalidarPedidosYProductos() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYProductos()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => void invalidar(),
  })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYProductos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: (pedido) => {
      void invalidar()
      useNotificationStore.getState().mostrar(`Pedido #${pedido.id} actualizado`)
    },
    onError: (error) =>
      useNotificationStore.getState().mostrar(handleApiError(error, 'No se pudo cambiar el estado del pedido')),
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYProductos()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: (pedido) => {
      void invalidar()
      useNotificationStore.getState().mostrar(`Pedido #${pedido.id} cancelado`)
    },
    onError: (error) =>
      useNotificationStore.getState().mostrar(handleApiError(error, 'No se pudo cancelar el pedido')),
  })
}
