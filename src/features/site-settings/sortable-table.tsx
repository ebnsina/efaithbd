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
import { DragDropVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ColumnDef, type RowData, tableFeatures, useTable } from '@tanstack/react-table'
import { type ReactNode, useId } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const features = tableFeatures({})
export type SortableColumn<T extends RowData> = ColumnDef<typeof features, T>
const emptyRows: never[] = []

interface SortableTableProps<T extends { id: string }> {
  columns: SortableColumn<T>[]
  rows: T[] | undefined
  isPending?: boolean
  isError?: boolean
  emptyMessage: string
  rowLabel: (row: T) => string
  // New id order after a drag; leave out for a list that can't be reordered
  onReorder?: (ids: string[], activeId: string, overId: string) => void
}

// Short content lists (banners, FAQs, menu…): the whole list on one screen, rows dragged into order
export function SortableTable<T extends { id: string }>({
  columns,
  rows,
  isPending,
  isError,
  emptyMessage,
  rowLabel,
  onReorder,
}: SortableTableProps<T>) {
  const dndId = useId()
  const table = useTable({
    features,
    columns,
    data: rows ?? emptyRows,
    getRowId: (row) => row.id,
  })
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const ids = (rows ?? emptyRows).map((row) => row.id)
  const colSpan = columns.length + (onReorder ? 1 : 0)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!onReorder || !over || active.id === over.id) return
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    onReorder(next, String(active.id), String(over.id))
  }

  const message = (content: ReactNode, className = 'text-muted-foreground') => (
    <TableRow>
      <TableCell colSpan={colSpan} className={cn('h-40 text-center', className)}>
        {content}
      </TableCell>
    </TableRow>
  )

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {onReorder && (
                  <TableHead className="w-10">
                    <span className="sr-only">Drag to reorder</span>
                  </TableHead>
                )}
                {group.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              message(<Spinner className="mx-auto size-6" />)
            ) : isError ? (
              message('Could not load this list. Please refresh the page.', 'text-destructive')
            ) : ids.length === 0 ? (
              message(emptyMessage)
            ) : (
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {table.getRowModel().rows.map((row) => (
                  <SortableRow key={row.id} id={row.id} label={rowLabel(row.original)} sortable={!!onReorder}>
                    {row.getAllCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </SortableRow>
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  )
}

function SortableRow({
  id,
  label,
  sortable,
  children,
}: {
  id: string
  label: string
  sortable: boolean
  children: ReactNode
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !sortable,
  })
  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 bg-muted shadow-sm')}
    >
      {sortable && (
        <TableCell className="w-10">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${label}`}
            className="flex size-8 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
          >
            <HugeiconsIcon icon={DragDropVerticalIcon} className="size-4" />
          </button>
        </TableCell>
      )}
      {children}
    </TableRow>
  )
}
