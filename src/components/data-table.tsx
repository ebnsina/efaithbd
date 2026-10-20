import { ArrowDown01Icon, ArrowLeft01Icon, ArrowRight01Icon, ArrowUp01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  type ColumnDef,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type ListResult, type ListSearch, PAGE_SIZE } from '@/lib/list-search'

export const dataTableFeatures = tableFeatures({ rowSortingFeature, rowPaginationFeature })
export type DataColumn<T extends RowData> = ColumnDef<typeof dataTableFeatures, T>

type TableFilter = { name: string; label: string; options: { value: string; label: string }[] }

const ALL = '__all'
const emptyRows: never[] = []
const count = new Intl.NumberFormat()

interface DataTableProps<T extends RowData> {
  columns: DataColumn<T>[]
  data: ListResult<T> | undefined
  search: ListSearch & Record<string, unknown>
  onSearchChange: (changes: Record<string, unknown>) => void
  isPending: boolean
  isError: boolean
  isFetching?: boolean
  searchPlaceholder?: string
  filters?: TableFilter[]
  emptyMessage?: string
  getRowId?: (row: T) => string
}

// Search, filters, sort and page all live in the route's URL search; the server returns one page at a time
export function DataTable<T extends RowData>({
  columns,
  data,
  search,
  onSearchChange,
  isPending,
  isError,
  isFetching,
  searchPlaceholder = 'Search…',
  filters = [],
  emptyMessage = 'Nothing found',
  getRowId,
}: DataTableProps<T>) {
  const [query, setQuery] = useState(search.q)

  // biome-ignore lint/correctness/useExhaustiveDependencies: the debounce reacts to typing only
  useEffect(() => {
    if (query === search.q) return
    const timer = setTimeout(() => onSearchChange({ q: query, page: 1 }), 300)
    return () => clearTimeout(timer)
  }, [query])

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: data?.rows ?? emptyRows,
    getRowId,
    rowCount: data?.rowCount ?? 0,
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination: { pageIndex: search.page - 1, pageSize: PAGE_SIZE },
      sorting: search.sort ? [{ id: search.sort, desc: search.dir === 'desc' }] : [],
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(table.state.pagination) : updater
      onSearchChange({ page: next.pageIndex + 1 })
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(table.state.sorting) : updater
      onSearchChange({ sort: next[0]?.id ?? '', dir: next[0]?.desc === false ? 'asc' : 'desc', page: 1 })
    },
  })

  const rowCount = data?.rowCount ?? 0
  const from = rowCount === 0 ? 0 : (search.page - 1) * PAGE_SIZE + 1
  const to = Math.min(search.page * PAGE_SIZE, rowCount)
  const message = (text: string, className = 'text-muted-foreground') => (
    <TableRow>
      <TableCell colSpan={columns.length} className={`h-48 text-center ${className}`}>
        {text}
      </TableCell>
    </TableRow>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-56 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.name}
            items={[{ value: ALL, label: `All ${filter.label.toLowerCase()}` }, ...filter.options]}
            value={(search[filter.name] as string) || ALL}
            onValueChange={(value) => onSearchChange({ [filter.name]: value === ALL ? undefined : value, page: 1 })}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label={filter.label}>
              <SelectValue />
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
        {isFetching && !isPending && <Spinner className="absolute top-3 right-3 size-4 text-muted-foreground" />}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.id === 'actions' ? 'sticky right-0 bg-card' : undefined}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted && (
                            <HugeiconsIcon icon={sorted === 'asc' ? ArrowUp01Icon : ArrowDown01Icon} className="size-3" />
                          )}
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
            {isPending ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              message('Could not load this list. Please refresh the page.', 'text-destructive')
            ) : table.getRowModel().rows.length === 0 ? (
              message(emptyMessage)
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'sticky right-0 bg-card' : undefined}>
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
          {count.format(from)}–{count.format(to)} of {count.format(rowCount)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <span>
            Page {search.page} of {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>
      </div>
    </div>
  )
}
