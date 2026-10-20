import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  FilterHorizontalIcon,
  PackageIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatNumber, useMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ProductGrid } from './product-card'
import { productListQuery } from './queries'
import { PRODUCTS_PAGE_SIZE, type ProductBrowse, productSorts } from './schemas'
import { Stars } from './stars'

type Option = { id: string; name: string; slug: string }
type SearchPatch = Partial<Omit<ProductBrowse, 'category'>> & { category?: string }

// Every filter is a link or navigation on the current route, so the URL is the single source of truth
function useSetSearch() {
  const navigate = useNavigate()
  return (patch: SearchPatch) =>
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, page: undefined, ...patch }),
      resetScroll: false,
    })
}

function FilterLink({ patch, active, children }: { patch: SearchPatch; active: boolean; children: ReactNode }) {
  return (
    <Link
      to="."
      search={(prev: Record<string, unknown>) => ({ ...prev, page: undefined, ...patch })}
      resetScroll={false}
      aria-current={active || undefined}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted',
        active && 'bg-primary/10 font-medium text-primary',
      )}
    >
      <span className={cn('size-3.5 shrink-0 rounded-full border', active && 'border-4 border-primary')} aria-hidden />
      {children}
    </Link>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 border-b pb-5 last:border-0">
      <h3 className="font-semibold text-sm">{title}</h3>
      {children}
    </section>
  )
}

function PriceFilter({ search, range }: { search: ProductBrowse; range?: { min: number | null; max: number | null } }) {
  const setSearch = useSetSearch()
  const money = useMoney()
  const [min, setMin] = useState(search.minPrice?.toString() ?? '')
  const [max, setMax] = useState(search.maxPrice?.toString() ?? '')
  return (
    <form
      className="space-y-2"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const values = [min, max].map((v) =>
          v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Math.max(0, Number(v)),
        )
        // Swap a reversed range rather than showing nothing
        const [lo, hi] =
          values[0] !== undefined && values[1] !== undefined && values[0] > values[1] ? [values[1], values[0]] : values
        setSearch({ minPrice: lo, maxPrice: hi })
      }}
    >
      {range?.min != null && range.max != null && (
        <p className="text-muted-foreground text-xs">
          Prices from {money(range.min)} to {money(range.max)}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Min"
          aria-label="Minimum price"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Max"
          aria-label="Maximum price"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
      </div>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Apply price
      </Button>
    </form>
  )
}

function Filters({
  search,
  categories,
  subcategories,
  range,
}: {
  search: ProductBrowse
  categories?: Option[]
  subcategories: Option[]
  range?: { min: number | null; max: number | null }
}) {
  return (
    <div className="space-y-5">
      {categories && categories.length > 0 && (
        <FilterGroup title="Category">
          <div className="max-h-72 space-y-0.5 overflow-y-auto">
            <FilterLink patch={{ category: undefined, subcategory: undefined }} active={!search.category}>
              All categories
            </FilterLink>
            {categories.map((category) => (
              <FilterLink
                key={category.id}
                patch={{ category: category.slug, subcategory: undefined }}
                active={search.category === category.slug}
              >
                {category.name}
              </FilterLink>
            ))}
          </div>
        </FilterGroup>
      )}
      {subcategories.length > 0 && (
        <FilterGroup title="Type">
          <div className="space-y-0.5">
            <FilterLink patch={{ subcategory: undefined }} active={!search.subcategory}>
              All
            </FilterLink>
            {subcategories.map((sub) => (
              <FilterLink key={sub.id} patch={{ subcategory: sub.slug }} active={search.subcategory === sub.slug}>
                {sub.name}
              </FilterLink>
            ))}
          </div>
        </FilterGroup>
      )}
      <FilterGroup title="Price">
        <PriceFilter key={`${search.minPrice}-${search.maxPrice}`} search={search} range={range} />
      </FilterGroup>
      <FilterGroup title="Customer rating">
        <div className="space-y-0.5">
          {[4, 3, 2, 1].map((stars) => (
            <FilterLink
              key={stars}
              patch={{ rating: search.rating === stars ? undefined : stars }}
              active={search.rating === stars}
            >
              <Stars value={stars} />
              <span>& up</span>
            </FilterLink>
          ))}
        </div>
      </FilterGroup>
    </div>
  )
}

function Pager({ page, pageCount }: { page: number; pageCount: number }) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  )
  const link = (target: number, children: ReactNode, label: string, disabled = false) =>
    disabled ? (
      <span
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'pointer-events-none opacity-50')}
        aria-hidden
      >
        {children}
      </span>
    ) : (
      <Link
        to="."
        search={(prev: Record<string, unknown>) => ({ ...prev, page: target })}
        aria-label={label}
        aria-current={target === page ? 'page' : undefined}
        className={buttonVariants({ variant: target === page ? 'default' : 'outline', size: 'icon' })}
      >
        {children}
      </Link>
    )
  return (
    <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {link(page - 1, <HugeiconsIcon icon={ArrowLeft01Icon} />, 'Previous page', page <= 1)}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
          {link(p, formatNumber(p), `Page ${p}`)}
        </span>
      ))}
      {link(page + 1, <HugeiconsIcon icon={ArrowRight01Icon} />, 'Next page', page >= pageCount)}
    </nav>
  )
}

export function ProductBrowser({
  search,
  title,
  intro,
  categories,
  subcategories,
}: {
  search: ProductBrowse
  title: string
  intro?: ReactNode
  categories?: Option[]
  subcategories: Option[]
}) {
  const products = useQuery(productListQuery(search))
  const setSearch = useSetSearch()
  const money = useMoney()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const data = products.data
  const subName = subcategories.find((s) => s.slug === search.subcategory)?.name
  const categoryName = categories?.find((c) => c.slug === search.category)?.name

  type Chip = { key: string; label: string; patch: SearchPatch }
  const chips = (
    [
      search.q && { key: 'q', label: `“${search.q}”`, patch: { q: '' } },
      categoryName && { key: 'category', label: categoryName, patch: { category: undefined, subcategory: undefined } },
      subName && { key: 'subcategory', label: subName, patch: { subcategory: undefined } },
      (search.minPrice !== undefined || search.maxPrice !== undefined) && {
        key: 'price',
        label:
          search.maxPrice === undefined
            ? `From ${money(search.minPrice ?? 0)}`
            : `${money(search.minPrice ?? 0)} – ${money(search.maxPrice)}`,
        patch: { minPrice: undefined, maxPrice: undefined },
      },
      search.rating && { key: 'rating', label: `${search.rating} stars & up`, patch: { rating: undefined } },
    ] as (Chip | false | '' | 0 | undefined)[]
  ).filter((chip): chip is Chip => !!chip)
  const clearAll = () =>
    setSearch({
      q: '',
      subcategory: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      ...(categories && { category: undefined }),
    })

  const filters = <Filters search={search} categories={categories} subcategories={subcategories} range={data?.priceRange} />
  const from = data && data.rowCount > 0 ? (search.page - 1) * PRODUCTS_PAGE_SIZE + 1 : 0
  const to = data ? Math.min(search.page * PRODUCTS_PAGE_SIZE, data.rowCount) : 0

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 space-y-2">
        <h1 className="font-bold text-2xl md:text-3xl">{title}</h1>
        {intro}
      </div>
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-36">{filters}</div>
        </aside>
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="mr-auto text-muted-foreground text-sm" aria-live="polite">
              {data
                ? data.rowCount === 0
                  ? 'No products'
                  : `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(data.rowCount)} products`
                : ' '}
            </p>
            {products.isFetching && <Spinner className="size-4 text-muted-foreground" />}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
                <HugeiconsIcon icon={FilterHorizontalIcon} />
                Filters{chips.length > 0 && ` (${chips.length})`}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div
                  className="px-4 pb-6"
                  onClickCapture={(e) => (e.target as HTMLElement).closest('a') && setFiltersOpen(false)}
                >
                  {filters}
                </div>
              </SheetContent>
            </Sheet>
            <Select items={productSorts} value={search.sort} onValueChange={(value) => value && setSearch({ sort: value })}>
              <SelectTrigger className="w-48" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productSorts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {chips.length > 0 && (
            <ul className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => setSearch(chip.patch)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm hover:bg-primary/20"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                  </button>
                </li>
              ))}
              <li>
                <Button variant="link" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              </li>
            </ul>
          )}

          {products.isPending ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : products.isError ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>We couldn't load the products</EmptyTitle>
                <EmptyDescription>Please check your connection and try again.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => products.refetch()}>Try again</Button>
              </EmptyContent>
            </Empty>
          ) : data && data.rows.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={PackageIcon} />
                </EmptyMedia>
                <EmptyTitle>{search.page > 1 && data.rowCount > 0 ? 'This page is empty' : 'No products found'}</EmptyTitle>
                <EmptyDescription>
                  {chips.length > 0 ? 'Try removing a filter or searching for something else.' : 'Please check back soon.'}
                </EmptyDescription>
              </EmptyHeader>
              {(chips.length > 0 || search.page > 1) && (
                <EmptyContent>
                  <Button variant="outline" onClick={clearAll}>
                    Show all products
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            data && (
              <div className={cn('transition-opacity', products.isPlaceholderData && 'opacity-60')}>
                <ProductGrid products={data.rows} />
                <Pager page={search.page} pageCount={data.pageCount} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
