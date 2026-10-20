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
import { type FooterLinkInput, type FooterSectionInput, footerLinkSchema, footerSectionSchema } from './schemas'
import { saveFooterLink, saveFooterSection } from './settings.functions'
import { SettingsCard } from './settings-card'
import { type SortableColumn, SortableTable } from './sortable-table'

type Section = Footer['sections'][number]
type Link = Section['links'][number]
type Deleting = { kind: 'section' | 'link'; id: string; name: string }

const key = settingsKeys.footer()

export function FooterColumns({ sections }: { sections: Section[] }) {
  const [editingSection, setEditingSection] = useState<Section | 'new' | null>(null)
  const [editingLink, setEditingLink] = useState<{
    link?: Link
    sectionId: string
  } | null>(null)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const reorderSections = useReorderRows<Footer>('footerSection', key, (data, ids) => ({
    ...data,
    sections: sortByIds(data.sections, ids),
  }))
  const reorderLinks = useReorderRows<Footer>('footerLink', key, (data, ids) => ({
    ...data,
    sections: data.sections.map((s) =>
      s.links.some((link) => ids.includes(link.id)) ? { ...s, links: sortByIds(s.links, ids) } : s,
    ),
  }))
  const deleteSection = useDeleteRow('footerSection', key, 'Column')
  const deleteLink = useDeleteRow('footerLink', key, 'Link')
  const deleter = deleting?.kind === 'section' ? deleteSection : deleteLink

  const sectionColumns: SortableColumn<Section>[] = [
    {
      id: 'title',
      header: 'Column heading',
      cell: ({ row }) => (
        <div className="min-w-36">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-muted-foreground text-xs">
            {row.original.links.length} {row.original.links.length === 1 ? 'link' : 'links'}
          </div>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="footerSection"
          id={row.original.id}
          active={row.original.active}
          queryKey={key}
          label={row.original.title}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.title}
          onEdit={() => setEditingSection(row.original)}
          onDelete={() =>
            setDeleting({
              kind: 'section',
              id: row.original.id,
              name: row.original.title,
            })
          }
        />
      ),
    },
  ]

  const linkColumns: SortableColumn<Link>[] = [
    {
      id: 'label',
      header: 'Link',
      cell: ({ row }) => (
        <div className="min-w-36">
          <div className="font-medium">{row.original.label}</div>
          <div className="text-muted-foreground text-xs">{row.original.url}</div>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="footerLink"
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
          onEdit={() =>
            setEditingLink({
              link: row.original,
              sectionId: row.original.sectionId,
            })
          }
          onDelete={() =>
            setDeleting({
              kind: 'link',
              id: row.original.id,
              name: row.original.label,
            })
          }
        />
      ),
    },
  ]

  return (
    <>
      <SettingsCard
        title="Footer link columns"
        description="Each column has a heading and a list of links. Drag to change the order."
        action={
          <Button size="sm" variant="outline" onClick={() => setEditingSection('new')}>
            <HugeiconsIcon icon={Add01Icon} />
            Add column
          </Button>
        }
      >
        <SortableTable
          columns={sectionColumns}
          rows={sections}
          emptyMessage="No columns yet."
          rowLabel={(s) => s.title}
          onReorder={(ids) => reorderSections.mutate(ids)}
        />
      </SettingsCard>

      {sections.map((section) => (
        <SettingsCard
          key={section.id}
          title={`Links in “${section.title}”`}
          action={
            <Button size="sm" variant="outline" onClick={() => setEditingLink({ sectionId: section.id })}>
              <HugeiconsIcon icon={Add01Icon} />
              Add link
            </Button>
          }
        >
          <SortableTable
            columns={linkColumns}
            rows={section.links}
            emptyMessage="No links in this column yet."
            rowLabel={(link) => link.label}
            onReorder={(ids) => reorderLinks.mutate(ids)}
          />
        </SettingsCard>
      ))}

      <EditDialog
        open={editingSection !== null}
        onOpenChange={(open) => !open && setEditingSection(null)}
        title={editingSection === 'new' ? 'Add a column' : 'Edit column'}
      >
        {editingSection && (
          <SectionForm
            key={editingSection === 'new' ? 'new' : editingSection.id}
            section={editingSection === 'new' ? undefined : editingSection}
            onDone={() => setEditingSection(null)}
          />
        )}
      </EditDialog>
      <EditDialog
        open={editingLink !== null}
        onOpenChange={(open) => !open && setEditingLink(null)}
        title={editingLink?.link ? 'Edit link' : 'Add a link'}
      >
        {editingLink && (
          <LinkForm
            key={editingLink.link?.id ?? 'new'}
            link={editingLink.link}
            sectionId={editingLink.sectionId}
            sections={sections}
            onDone={() => setEditingLink(null)}
          />
        )}
      </EditDialog>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting?.kind === 'section' ? 'Delete this column?' : 'Delete this link?'}
        description={
          deleting?.kind === 'section'
            ? `“${deleting?.name}” and all its links will be removed from the footer. This can't be undone.`
            : `“${deleting?.name}” will be removed from the footer. This can't be undone.`
        }
        pending={deleter.isPending}
        onConfirm={() => deleting && deleter.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}

function SectionForm({ section, onDone }: { section?: Section; onDone: () => void }) {
  const save = useSave((values: FooterSectionInput) => saveFooterSection({ data: { id: section?.id, values } }), {
    invalidate: [key],
    success: section ? 'Column saved' : 'Column added',
    failure: 'Could not save this column. Please try again.',
  })
  const form = useAppForm({
    defaultValues: {
      title: section?.title ?? '',
      active: section?.active ?? true,
    },
    validators: { onSubmit: footerSectionSchema },
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
      <form.AppField name="title">
        {(field) => <field.TextField label="Heading" placeholder="Help & support" />}
      </form.AppField>
      <form.AppField name="active">{(field) => <field.SwitchField label="Show in the footer" />}</form.AppField>
      <EditDialogFooter>
        <form.AppForm>
          <form.SubmitButton label={section ? 'Save' : 'Add'} pendingLabel="Saving…" />
        </form.AppForm>
      </EditDialogFooter>
    </form>
  )
}

function LinkForm({
  link,
  sectionId,
  sections,
  onDone,
}: {
  link?: Link
  sectionId: string
  sections: Section[]
  onDone: () => void
}) {
  const save = useSave((values: FooterLinkInput) => saveFooterLink({ data: { id: link?.id, values } }), {
    invalidate: [key],
    success: link ? 'Link saved' : 'Link added',
    failure: 'Could not save this link. Please try again.',
  })
  const form = useAppForm({
    defaultValues: {
      sectionId,
      label: link?.label ?? '',
      url: link?.url ?? '',
      active: link?.active ?? true,
    },
    validators: { onSubmit: footerLinkSchema },
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
      <form.AppField name="label">{(field) => <field.TextField label="Text" placeholder="About us" />}</form.AppField>
      <form.AppField name="url">
        {(field) => (
          <field.TextField
            label="Link"
            placeholder="/about"
            description="A page on this site starting with /, or a full https:// link."
          />
        )}
      </form.AppField>
      <form.AppField name="sectionId">
        {(field) => <field.SelectField label="Column" options={sections.map((s) => ({ value: s.id, label: s.title }))} />}
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
