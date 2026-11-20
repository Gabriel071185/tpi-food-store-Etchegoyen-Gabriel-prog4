import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Button } from '@/shared/ui/Button'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  /** Paginación del lado del cliente. Desactivarla si la página ya viene paginada del servidor. */
  paginar?: boolean
  tamanoPagina?: number
}

export function DataTable<T>({ data, columns, paginar = true, tamanoPagina = 10 }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(paginar
      ? { getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: tamanoPagina } } }
      : {}),
  })

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-surface-2">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-surface-2' : ''
                    }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-2">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-ink-soft">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginar && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="text-sm text-muted">
            Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{' '}
            <strong>{table.getPageCount()}</strong>
          </span>
          <div className="flex gap-2">
            <Button variante="secundario" pequeno onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variante="secundario" pequeno onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
