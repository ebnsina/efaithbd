'use client'

import {
  type ColumnDef,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PAGE_SIZE } from '@/lib/list-params'

export const tableFeaturesSet = tableFeatures({ rowSortingFeature, rowPaginationFeature })
export type DataColumn<T extends RowData> = ColumnDef<typeof tableFeaturesSet, T>
export type ListResponse<T> = { rows: T[]; rowCount: number }

const ALL = '__all'

// Table state lives in the URL so search, filters and page survive reloads and can be shared
export function useListParams(filterNames: readonly string[] = []) {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const params = {
    q: searchParams.get('q') ?? '',
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    sort: searchParams.get('sort') ?? '',
    dir: searchParams.get('dir') === 'asc' ? ('asc' as const) : ('desc' as const),
    filters: Object.fromEntries(filterNames.map((name) => [name, searchParams.get(name) ?? ''])),
  }

  const set = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '' || (key === 'page' && value === 1)) next.delete(key)
      else next.set(key, String(value))
    }
    const query = next.toString()
    // Native history update: Next syncs useSearchParams without a server round trip
    window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname)
  }

  // The string form is what goes to the API and into the query key
  const apiQuery = new URLSearchParams(
    Object.entries({ q: params.q, page: String(params.page), sort: params.sort, dir: params.dir, ...params.filters }).filter(
      ([, value]) => value !== ''
    )
  ).toString()

  return { ...params, set, apiQuery }
}

type Filter = { name: string; label: string; options: { value: string; label: string }[] }

interface DataTableProps<T extends RowData> {
  columns: DataColumn<T>[]
  data: ListResponse<T> | undefined
  list: ReturnType<typeof useListParams>
  isLoading: boolean
  isError: boolean
  isFetching?: boolean
  searchPlaceholder?: string
  filters?: Filter[]
  emptyMessage?: string
  getRowId?: (row: T) => string
}

const emptyRows: never[] = []

export function DataTable<T extends RowData>({
  columns,
  data,
  list,
  isLoading,
  isError,
  isFetching,
  searchPlaceholder = 'Search…',
  filters = [],
  emptyMessage = 'Nothing found',
  getRowId,
}: DataTableProps<T>) {
  const [search, setSearch] = useState(list.q)

  // biome-ignore lint/correctness/useExhaustiveDependencies: the debounce reacts to typing only
  useEffect(() => {
    if (search === list.q) return
    const timer = setTimeout(() => list.set({ q: search, page: 1 }), 300)
    return () => clearTimeout(timer)
  }, [search])

  const table = useTable({
    features: tableFeaturesSet,
    columns,
    data: data?.rows ?? emptyRows,
    getRowId,
    rowCount: data?.rowCount ?? 0,
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination: { pageIndex: list.page - 1, pageSize: PAGE_SIZE },
      sorting: list.sort ? [{ id: list.sort, desc: list.dir === 'desc' }] : [],
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(table.state.pagination) : updater
      list.set({ page: next.pageIndex + 1 })
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(table.state.sorting) : updater
      list.set({ sort: next[0]?.id ?? null, dir: next[0] ? (next[0].desc ? 'desc' : 'asc') : null, page: 1 })
    },
  })

  const rowCount = data?.rowCount ?? 0
  const from = rowCount === 0 ? 0 : (list.page - 1) * PAGE_SIZE + 1
  const to = Math.min(list.page * PAGE_SIZE, rowCount)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.name}
            value={list.filters[filter.name] || ALL}
            onValueChange={(value) => list.set({ [filter.name]: value === ALL ? null : value, page: 1 })}
          >
            <SelectTrigger className="sm:w-48" aria-label={filter.label}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All {filter.label.toLowerCase()}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="relative overflow-x-auto rounded-lg border bg-card">
        {isFetching && !isLoading && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : null}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-destructive">
                  Could not load this list. Please refresh the page.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 text-muted-foreground text-sm">
        <span>
          {new Intl.NumberFormat().format(from)}–{new Intl.NumberFormat().format(to)} of{' '}
          {new Intl.NumberFormat().format(rowCount)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {list.page} of {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
