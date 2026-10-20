import { Add01Icon, ArrowMoveDownRightIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type MenuItem, MenuItemDialog } from './menu-item-dialog'
import { type Menu, menuQuery, settingsKeys } from './queries'
import { RowActions } from './row-actions'
import { ActiveSwitch, useDeleteRow, useReorderRows } from './rows'
import { menuTypes } from './schemas'
import { SettingsCard } from './settings-card'
import { type SortableColumn, SortableTable } from './sortable-table'

const key = settingsKeys.menu()

// Top-level items in order, each followed by its sub-items
function flatten(items: MenuItem[]) {
  const byOrder = (a: MenuItem, b: MenuItem) => a.order - b.order
  const tops = items.filter((item) => !item.parentId).sort(byOrder)
  const topIds = new Set(tops.map((item) => item.id))
  const orphans = items.filter((item) => item.parentId && !topIds.has(item.parentId))
  return [...tops.flatMap((top) => [top, ...items.filter((item) => item.parentId === top.id).sort(byOrder)]), ...orphans]
}

export function MenuTab() {
  const { data: menu } = useSuspenseQuery(menuQuery())
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null)
  const [deleting, setDeleting] = useState<MenuItem | null>(null)
  const reorder = useReorderRows<Menu>('menuItem', key, (data, ids) => ({
    ...data,
    items: data.items.map((item) => (ids.includes(item.id) ? { ...item, order: ids.indexOf(item.id) } : item)),
  }))
  const deleteItem = useDeleteRow('menuItem', key, 'Menu item')
  const rows = flatten(menu.items)

  const onReorder = (ids: string[], activeId: string, overId: string) => {
    const parentOf = (id: string) => menu.items.find((item) => item.id === id)?.parentId ?? null
    const parent = parentOf(activeId)
    if (parent !== parentOf(overId)) {
      toast.info('Drag items within the same level. To move an item under another one, edit it and choose “Show under”.')
      return
    }
    reorder.mutate(ids.filter((id) => parentOf(id) === parent))
  }

  const columns: SortableColumn<MenuItem>[] = [
    {
      id: 'label',
      header: 'Menu item',
      cell: ({ row }) => (
        <div className={row.original.parentId ? 'flex min-w-48 items-center gap-2 pl-6' : 'min-w-48'}>
          {row.original.parentId && (
            <HugeiconsIcon icon={ArrowMoveDownRightIcon} className="size-4 shrink-0 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium">{row.original.label}</div>
            <div className="text-muted-foreground text-xs">{row.original.url}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Links to',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{menuTypes.find((t) => t.value === row.original.type)?.label}</Badge>
          {row.original.megaMenu && <Badge variant="secondary">Large drop-down</Badge>}
          {row.original.featured && <Badge variant="secondary">Featured</Badge>}
          {row.original.openInNewTab && <Badge variant="secondary">New tab</Badge>}
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="menuItem"
          id={row.original.id}
          active={row.original.active}
          queryKey={key}
          label={row.original.label}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.label}
          onEdit={() => setEditing(row.original)}
          onDelete={() => setDeleting(row.original)}
        />
      ),
    },
  ]

  const childCount = deleting ? menu.items.filter((item) => item.parentId === deleting.id).length : 0

  return (
    <>
      <SettingsCard
        title="Main menu"
        description="The links at the top of your store. Drag to change the order; sub-items move within their parent."
        action={
          <Button size="sm" variant="outline" onClick={() => setEditing('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add menu item
          </Button>
        }
      >
        <SortableTable
          columns={columns}
          rows={rows}
          emptyMessage="Your menu is empty. Add the first item."
          rowLabel={(item) => item.label}
          onReorder={onReorder}
        />
      </SettingsCard>
      <MenuItemDialog item={editing} menu={menu} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this menu item?"
        description={`“${deleting?.label}”${childCount ? ` and its ${childCount} sub-item${childCount === 1 ? '' : 's'}` : ''} will be removed from the menu. This can't be undone.`}
        pending={deleteItem.isPending}
        onConfirm={() => deleting && deleteItem.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}
