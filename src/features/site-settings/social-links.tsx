import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAppForm } from '@/components/form'
import { Button } from '@/components/ui/button'
import { EditDialog, EditDialogFooter } from './edit-dialog'
import { type Footer, settingsKeys, useSave } from './queries'
import { RowActions } from './row-actions'
import { ActiveSwitch, sortByIds, useDeleteRow, useReorderRows } from './rows'
import { platformLabel, type SocialLinkInput, socialLinkSchema, socialPlatforms } from './schemas'
import { saveSocialLink } from './settings.functions'
import { SettingsCard } from './settings-card'
import { type SortableColumn, SortableTable } from './sortable-table'

type SocialLink = Footer['socialLinks'][number]
const key = settingsKeys.footer()

export function SocialLinks({ links }: { links: SocialLink[] }) {
  const [editing, setEditing] = useState<SocialLink | 'new' | null>(null)
  const [deleting, setDeleting] = useState<SocialLink | null>(null)
  const reorder = useReorderRows<Footer>('socialLink', key, (data, ids) => ({
    ...data,
    socialLinks: sortByIds(data.socialLinks, ids),
  }))
  const deleteLink = useDeleteRow('socialLink', key, 'Social link')

  const columns: SortableColumn<SocialLink>[] = [
    {
      id: 'platform',
      header: 'Platform',
      cell: ({ row }) => (
        <div className="min-w-36">
          <div className="font-medium">{platformLabel(row.original.platform)}</div>
          <div className="max-w-64 truncate text-muted-foreground text-xs">{row.original.url}</div>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="socialLink"
          id={row.original.id}
          active={row.original.active}
          queryKey={key}
          label={platformLabel(row.original.platform)}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={platformLabel(row.original.platform)}
          onEdit={() => setEditing(row.original)}
          onDelete={() => setDeleting(row.original)}
        />
      ),
    },
  ]

  return (
    <>
      <SettingsCard
        title="Social media"
        description="Links to your pages, shown as icons in the footer."
        action={
          <Button size="sm" variant="outline" onClick={() => setEditing('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add social link
          </Button>
        }
      >
        <SortableTable
          columns={columns}
          rows={links}
          emptyMessage="No social links yet."
          rowLabel={(link) => platformLabel(link.platform)}
          onReorder={(ids) => reorder.mutate(ids)}
        />
      </SettingsCard>
      <EditDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === 'new' ? 'Add a social link' : 'Edit social link'}
      >
        {editing && (
          <SocialLinkForm
            key={editing === 'new' ? 'new' : editing.id}
            link={editing === 'new' ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </EditDialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this social link?"
        description={`The ${platformLabel(deleting?.platform ?? '')} icon will be removed from the footer.`}
        pending={deleteLink.isPending}
        onConfirm={() => deleting && deleteLink.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}

function SocialLinkForm({ link, onDone }: { link?: SocialLink; onDone: () => void }) {
  const save = useSave((values: SocialLinkInput) => saveSocialLink({ data: { id: link?.id, values } }), {
    invalidate: [key],
    success: link ? 'Social link saved' : 'Social link added',
    failure: 'Could not save this social link. Please try again.',
  })
  const form = useAppForm({
    defaultValues: {
      platform: (link?.platform ?? 'facebook') as SocialLinkInput['platform'],
      url: link?.url ?? '',
      active: link?.active ?? true,
    },
    validators: { onSubmit: socialLinkSchema },
    onSubmit: async ({ value }) => {
      if (await save.mutateAsync(value).catch(() => null)) onDone()
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
      <form.AppField name="platform">
        {(field) => <field.SelectField label="Platform" options={[...socialPlatforms]} />}
      </form.AppField>
      <form.AppField name="url">
        {(field) => <field.TextField label="Link to your page" placeholder="https://facebook.com/yourshop" />}
      </form.AppField>
      <form.AppField name="active">{(field) => <field.SwitchField label="Show in the footer" />}</form.AppField>
      <EditDialogFooter>
        <form.AppForm>
          <form.SubmitButton label={link ? 'Save' : 'Add'} pendingLabel="Saving…" />
        </form.AppForm>
      </EditDialogFooter>
    </form>
  )
}
