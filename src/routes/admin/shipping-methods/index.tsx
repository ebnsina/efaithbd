import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Add01Icon, Delete02Icon, DragDropVerticalIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type ColumnDef, type Row, tableFeatures, useTable } from '@tanstack/react-table'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  type ShippingMethod,
  shippingMethodsQuery,
  useDeleteShippingMethod,
  useReorderShippingMethods,
} from '@/features/shipping/queries'
import { ShippingDialog } from '@/features/shipping/shipping-dialog'
import { useMoney } from '@/lib/format'

export const Route = createFileRoute('/admin/shipping-methods/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(shippingMethodsQuery),
  head: () => ({ meta: [{ title: 'Shipping methods' }] }),
  component: ShippingMethodsPage,
})

const features = tableFeatures({})
const emptyRows: ShippingMethod[] = []

function ShippingMethodsPage() {
  const money = useMoney()
  const methods = useQuery(shippingMethodsQuery)
  const reorder = useReorderShippingMethods()
  const deleteMethod = useDeleteShippingMethod()
  const [editing, setEditing] = useState<ShippingMethod | 'new' | null>(null)
  const [deleting, setDeleting] = useState<ShippingMethod | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const columns: ColumnDef<typeof features, ShippingMethod>[] = [
    { id: 'drag', header: () => <span className="sr-only">Reorder</span> },
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && <div className="text-muted-foreground text-xs">{row.original.description}</div>}
        </div>
      ),
    },
    {
      id: 'cost',
      header: 'Charge',
      cell: ({ row }) => <span className="tabular-nums">{money(row.original.cost)}</span>,
    },
    {
      id: 'limits',
      header: 'Order size',
      cell: ({ row }) => {
        const { minOrder, maxOrder } = row.original
        return (
          <span className="text-muted-foreground">
            {minOrder !== null && maxOrder !== null
              ? `${money(minOrder)} – ${money(maxOrder)}`
              : minOrder !== null
                ? `From ${money(minOrder)}`
                : maxOrder !== null
                  ? `Up to ${money(maxOrder)}`
                  : 'Any'}
          </span>
        )
      },
    },
    {
      id: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>{row.original.active ? 'Active' : 'Hidden'}</Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.original.name}`}
            onClick={() => setEditing(row.original)}
          >
            <HugeiconsIcon icon={PencilEdit02Icon} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.original.name}`}
            onClick={() => setDeleting(row.original)}
          >
            <HugeiconsIcon icon={Delete02Icon} />
          </Button>
        </div>
      ),
    },
  ]

  const table = useTable({
    features,
    columns,
    data: methods.data ?? emptyRows,
    getRowId: (method) => method.id,
  })
  const rows = table.getRowModel().rows

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const list = methods.data
    if (!list || !over || active.id === over.id) return
    const from = list.findIndex((m) => m.id === active.id)
    const to = list.findIndex((m) => m.id === over.id)
    reorder.mutate(arrayMove(list, from, to))
  }

  return (
    <>
      <PageHeader
        title="Shipping methods"
        description="Delivery choices and charges shown at checkout. Drag to change their order."
        action={
          <Button onClick={() => setEditing('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add shipping method
          </Button>
        }
      />
      <div className="relative overflow-x-auto rounded-lg border bg-card">
        {reorder.isPending && <Spinner className="absolute top-3 right-3 size-4 text-muted-foreground" />}
        <DndContext id="shipping-methods" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id} className={header.column.id === 'drag' ? 'w-10' : undefined}>
                      <table.FlexRender header={header} />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {methods.isPending ? (
                <Message colSpan={columns.length}>
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </Message>
              ) : methods.isError ? (
                <Message colSpan={columns.length} className="text-destructive">
                  Could not load shipping methods. Please refresh the page.
                </Message>
              ) : rows.length === 0 ? (
                <Message colSpan={columns.length}>
                  No shipping methods yet. Add one so customers can choose how to get their order.
                </Message>
              ) : (
                <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
                  {rows.map((row) => (
                    <SortableRow key={row.id} row={row} table={table} />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <ShippingDialog method={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this shipping method?"
        description={`“${deleting?.name}” will no longer be offered at checkout. Past orders keep their charge. This can't be undone.`}
        pending={deleteMethod.isPending}
        onConfirm={() =>
          deleting &&
          deleteMethod.mutate(deleting.id, {
            onSettled: () => setDeleting(null),
          })
        }
      />
    </>
  )
}

function SortableRow({
  row,
  table,
}: {
  row: Row<typeof features, ShippingMethod>
  table: {
    FlexRender: ReturnType<typeof useTable<typeof features, ShippingMethod>>['FlexRender']
  }
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  })
  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'relative z-10 bg-muted' : undefined}
    >
      {row.getAllCells().map((cell) => (
        <TableCell key={cell.id}>
          {cell.column.id === 'drag' ? (
            <Button
              ref={setActivatorNodeRef}
              variant="ghost"
              size="icon-sm"
              className="cursor-grab touch-none active:cursor-grabbing"
              aria-label={`Move ${row.original.name}`}
              {...attributes}
              {...listeners}
            >
              <HugeiconsIcon icon={DragDropVerticalIcon} />
            </Button>
          ) : (
            <table.FlexRender cell={cell} />
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

function Message({ colSpan, className, children }: { colSpan: number; className?: string; children: React.ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={`h-40 text-center text-muted-foreground ${className ?? ''}`}>
        {children}
      </TableCell>
    </TableRow>
  )
}
