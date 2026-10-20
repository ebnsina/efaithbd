import { useAppForm } from '@/components/form'
import { EditDialog, EditDialogFooter } from './edit-dialog'
import { type Menu, settingsKeys, useSave } from './queries'
import { type MenuItemInput, menuItemSchema, menuTypes, TOP_LEVEL } from './schemas'
import { saveMenuItem } from './settings.functions'

export type MenuItem = Menu['items'][number]

export function MenuItemDialog({
  item,
  menu,
  onClose,
}: {
  item: MenuItem | 'new' | null
  menu: Menu
  onClose: () => void
}) {
  return (
    <EditDialog
      open={item !== null}
      onOpenChange={(open) => !open && onClose()}
      title={item === 'new' ? 'Add a menu item' : 'Edit menu item'}
      description="An entry in the main menu at the top of your store."
    >
      {item && (
        <MenuItemForm
          key={item === 'new' ? 'new' : item.id}
          item={item === 'new' ? undefined : item}
          menu={menu}
          onDone={onClose}
        />
      )}
    </EditDialog>
  )
}

const targetLabels = {
  CATEGORY: 'Category',
  PRODUCT: 'Product',
  PAGE: 'Page',
} as const

function MenuItemForm({ item, menu, onDone }: { item?: MenuItem; menu: Menu; onDone: () => void }) {
  const save = useSave((values: MenuItemInput) => saveMenuItem({ data: { id: item?.id, values } }), {
    invalidate: [settingsKeys.menu()],
    success: item ? 'Menu item saved' : 'Menu item added',
    failure: 'Could not save this menu item. Please try again.',
  })
  const hasChildren = !!item && menu.items.some((other) => other.parentId === item.id)
  const parents = [
    { value: TOP_LEVEL, label: 'None (top level)' },
    ...menu.items
      .filter((other) => !other.parentId && other.id !== item?.id)
      .map((other) => ({ value: other.id, label: other.label })),
  ]
  const form = useAppForm({
    defaultValues: {
      label: item?.label ?? '',
      type: item?.type ?? 'CUSTOM',
      url: item?.type === 'CUSTOM' ? item.url : '',
      targetId: item?.targetId ?? '',
      parentId: item?.parentId ?? TOP_LEVEL,
      openInNewTab: item?.openInNewTab ?? false,
      megaMenu: item?.megaMenu ?? false,
      featured: item?.featured ?? false,
      active: item?.active ?? true,
    } as MenuItemInput,
    validators: { onSubmit: menuItemSchema },
    onSubmit: async ({ value }) => {
      const result = await save.mutateAsync(value).catch(() => null)
      if (result?.ok) onDone()
    },
  })

  return (
    <form
      method="post"
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="label">{(field) => <field.TextField label="Text" placeholder="Books" />}</form.AppField>
      <form.AppField name="type" listeners={{ onChange: () => form.setFieldValue('targetId', '') }}>
        {(field) => <field.SelectField label="Links to" options={[...menuTypes]} />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.type}>
        {(type) =>
          type === 'CUSTOM' ? (
            <form.AppField name="url">
              {(field) => (
                <field.TextField
                  label="Link"
                  placeholder="/products"
                  description="A page on this site starting with /, or a full https:// link."
                />
              )}
            </form.AppField>
          ) : (
            <form.AppField name="targetId">
              {(field) =>
                menu.targets[type].length ? (
                  <field.SelectField label={targetLabels[type]} options={menu.targets[type]} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    There is nothing of this kind yet. Add one first, or choose another option.
                  </p>
                )
              }
            </form.AppField>
          )
        }
      </form.Subscribe>
      {hasChildren ? (
        <p className="text-muted-foreground text-sm">This item has sub-items, so it stays at the top level.</p>
      ) : (
        <form.AppField name="parentId">
          {(field) => (
            <field.SelectField
              label="Show under"
              options={parents}
              description="Pick a top-level item to show this as one of its sub-items."
            />
          )}
        </form.AppField>
      )}
      <div className="space-y-4 rounded-lg border p-4">
        <form.AppField name="active">{(field) => <field.SwitchField label="Show in the menu" />}</form.AppField>
        <form.AppField name="openInNewTab">{(field) => <field.SwitchField label="Open in a new tab" />}</form.AppField>
        <form.AppField name="megaMenu">
          {(field) => <field.SwitchField label="Large drop-down" description="Show sub-items in a wide panel." />}
        </form.AppField>
        <form.AppField name="featured">
          {(field) => <field.SwitchField label="Featured" description="Make this item stand out." />}
        </form.AppField>
      </div>
      <EditDialogFooter>
        <form.AppForm>
          <form.SubmitButton label={item ? 'Save' : 'Add'} pendingLabel="Saving…" />
        </form.AppForm>
      </EditDialogFooter>
    </form>
  )
}
