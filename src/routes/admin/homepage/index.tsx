import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { type Homepage, homepageKeys, homepageQuery } from '@/features/homepage/queries'
import { sectionTypeLabel } from '@/features/homepage/schemas'
import { RowActions } from '@/features/site-settings/row-actions'
import { ActiveSwitch, sortByIds, useDeleteRow, useReorderRows } from '@/features/site-settings/rows'
import type { ContentTable } from '@/features/site-settings/rows.functions'
import { type SortableColumn, SortableTable } from '@/features/site-settings/sortable-table'

export const Route = createFileRoute('/admin/homepage/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(homepageQuery()),
  head: () => ({ meta: [{ title: 'Homepage' }] }),
  component: HomepagePage,
})

type Section = Homepage['sections'][number]
type FeatureCard = Homepage['featureCards'][number]
type MidBanner = Homepage['midBanners'][number]
type Deleting = { table: ContentTable; id: string; noun: string; name: string }

const key = homepageKeys.overview()

function HomepagePage() {
  const homepage = useQuery(homepageQuery())
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const reorderSections = useReorderRows<Homepage>('productSection', key, (data, ids) => ({
    ...data,
    sections: sortByIds(data.sections, ids),
  }))
  const reorderCards = useReorderRows<Homepage>('featureCard', key, (data, ids) => ({
    ...data,
    featureCards: sortByIds(data.featureCards, ids),
  }))
  const deleteSection = useDeleteRow('productSection', homepageKeys.all, 'Section')
  const deleteCard = useDeleteRow('featureCard', homepageKeys.all, 'Feature card')
  const deleteMidBanner = useDeleteRow('midBanner', homepageKeys.all, 'Banner')
  const deleters = {
    productSection: deleteSection,
    featureCard: deleteCard,
    midBanner: deleteMidBanner,
  }
  const deleter = deleting ? deleters[deleting.table as keyof typeof deleters] : null
  const sections = homepage.data?.sections ?? []

  const sectionColumns: SortableColumn<Section>[] = [
    {
      id: 'title',
      header: 'Section',
      cell: ({ row }) => (
        <div className="min-w-40">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-muted-foreground text-xs">{sectionTypeLabel(row.original.type)}</div>
        </div>
      ),
    },
    { id: 'limit', header: 'Products', cell: ({ row }) => row.original.limit },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="productSection"
          id={row.original.id}
          active={row.original.active}
          queryKey={homepageKeys.all}
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
          editLink={<Link to="/admin/homepage/sections/$id" params={{ id: row.original.id }} />}
          onDelete={() =>
            setDeleting({
              table: 'productSection',
              id: row.original.id,
              noun: 'section',
              name: row.original.title,
            })
          }
        />
      ),
    },
  ]

  const cardColumns: SortableColumn<FeatureCard>[] = [
    {
      id: 'title',
      header: 'Feature card',
      cell: ({ row }) => (
        <div className="flex min-w-48 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
            {row.original.icon}
          </span>
          <div>
            <div className="font-medium">{row.original.title}</div>
            {row.original.description && (
              <div className="text-muted-foreground text-xs">{row.original.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="featureCard"
          id={row.original.id}
          active={row.original.active}
          queryKey={homepageKeys.all}
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
          editLink={<Link to="/admin/homepage/feature-cards/$id" params={{ id: row.original.id }} />}
          onDelete={() =>
            setDeleting({
              table: 'featureCard',
              id: row.original.id,
              noun: 'feature card',
              name: row.original.title,
            })
          }
        />
      ),
    },
  ]

  const midBannerColumns: SortableColumn<MidBanner>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <img src={row.original.image} alt="" loading="lazy" className="h-12 w-24 rounded-md bg-muted object-cover" />
      ),
    },
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => <div className="min-w-32 font-medium">{row.original.title || 'No title'}</div>,
    },
    {
      id: 'position',
      header: 'Shown after',
      cell: ({ row }) => {
        const section = sections[row.original.position - 1]
        return section ? section.title : <Badge variant="outline">Section {row.original.position} (not set up)</Badge>
      },
    },
    {
      id: 'active',
      header: 'Shown',
      cell: ({ row }) => (
        <ActiveSwitch
          table="midBanner"
          id={row.original.id}
          active={row.original.active}
          queryKey={homepageKeys.all}
          label={row.original.title || 'This banner'}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          label={row.original.title || 'banner'}
          editLink={<Link to="/admin/homepage/mid-banners/$id" params={{ id: row.original.id }} />}
          onDelete={() =>
            setDeleting({
              table: 'midBanner',
              id: row.original.id,
              noun: 'banner',
              name: row.original.title || 'Banner',
            })
          }
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Homepage" description="Choose what appears on your homepage and in which order." />
      <div className="space-y-10">
        <Block
          title="Product sections"
          description="Rows of products on the homepage. Drag to change the order."
          action={
            <Link to="/admin/homepage/sections/$id" params={{ id: 'new' }} className={buttonVariants({ size: 'sm' })}>
              <HugeiconsIcon icon={Add01Icon} />
              Add section
            </Link>
          }
        >
          <SortableTable
            columns={sectionColumns}
            rows={homepage.data?.sections}
            isPending={homepage.isPending}
            isError={homepage.isError}
            emptyMessage="No product sections yet."
            rowLabel={(row) => row.title}
            onReorder={(ids) => reorderSections.mutate(ids)}
          />
        </Block>
        <Block
          title="Feature cards"
          description="Small cards with an icon, such as free delivery or secure payment."
          action={
            <Link
              to="/admin/homepage/feature-cards/$id"
              params={{ id: 'new' }}
              className={buttonVariants({ size: 'sm' })}
            >
              <HugeiconsIcon icon={Add01Icon} />
              Add card
            </Link>
          }
        >
          <SortableTable
            columns={cardColumns}
            rows={homepage.data?.featureCards}
            isPending={homepage.isPending}
            isError={homepage.isError}
            emptyMessage="No feature cards yet."
            rowLabel={(row) => row.title}
            onReorder={(ids) => reorderCards.mutate(ids)}
          />
        </Block>
        <Block
          title="Banners between sections"
          description="Wide images shown between the product sections."
          action={
            <Link
              to="/admin/homepage/mid-banners/$id"
              params={{ id: 'new' }}
              className={buttonVariants({ size: 'sm' })}
            >
              <HugeiconsIcon icon={Add01Icon} />
              Add banner
            </Link>
          }
        >
          <SortableTable
            columns={midBannerColumns}
            rows={homepage.data?.midBanners}
            isPending={homepage.isPending}
            isError={homepage.isError}
            emptyMessage="No banners between sections yet."
            rowLabel={(row) => row.title || 'banner'}
          />
        </Block>
      </div>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete this ${deleting?.noun}?`}
        description={`“${deleting?.name}” will be removed from your homepage. This can't be undone.`}
        pending={deleter?.isPending}
        onConfirm={() => deleting && deleter?.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </>
  )
}

function Block({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
