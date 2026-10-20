import {
  ArrowDown01Icon,
  FavouriteIcon,
  GridViewIcon,
  Login01Icon,
  Logout01Icon,
  Menu01Icon,
  Search01Icon,
  ShoppingCart01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, useHydrated, useNavigate, useRouter } from '@tanstack/react-router'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { logout } from '@/features/auth/auth.functions'
import { siteSettingsQuery } from '@/features/settings/queries'
import { formatNumber } from '@/lib/format'
import { useCart, useWishlist } from '@/lib/store'
import { cn } from '@/lib/utils'
import { DbLink } from './db-link'
import { shopLayoutQuery } from './queries'

export type ShopUser = { name: string; isAdmin: boolean } | null

function SearchForm({ className, onDone }: { className?: string; onDone?: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      role="search"
      className={cn('relative', className)}
      onSubmit={(e) => {
        e.preventDefault()
        navigate({ to: '/products', search: { q: q.trim() } })
        onDone?.()
      }}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
      />
      <Input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-10 bg-background pl-9 text-foreground"
      />
    </form>
  )
}

function CountBadge({ count }: { count: number }) {
  // Cart and wishlist live in this browser's storage, so the server can't know them; show counts after hydration
  const hydrated = useHydrated()
  if (!hydrated || count === 0) return null
  return (
    <span className="-top-1 -right-1 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-background px-1 font-semibold text-[10px] text-primary">
      {formatNumber(count)}
    </span>
  )
}

function useLogout() {
  const router = useRouter()
  return async () => {
    try {
      await logout()
      await router.invalidate()
      toast.success('You have signed out')
    } catch {
      toast.error('Could not sign you out. Please try again.')
    }
  }
}

function NavIconLink({ to, label, icon, count }: { to: '/cart' | '/wishlist'; label: string; icon: typeof UserIcon; count: number }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-md p-2 hover:bg-primary-foreground/15" aria-label={label}>
      <span className="relative">
        <HugeiconsIcon icon={icon} className="size-6" />
        <CountBadge count={count} />
      </span>
      <span className="hidden font-medium text-sm lg:inline">{label}</span>
    </Link>
  )
}

function HoverMenu({ trigger, children, wide }: { trigger: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className="group relative">
      {trigger}
      <div
        className={cn(
          'invisible absolute top-full left-0 z-50 pt-1 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100',
          wide ? 'w-[min(56rem,90vw)]' : 'min-w-56',
        )}
      >
        <div className="max-h-[70vh] overflow-y-auto rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}

const barLink = 'flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 font-medium text-sm hover:bg-primary-foreground/15'
const menuLink = 'block rounded-md px-3 py-2 text-sm hover:bg-muted'

export function Navbar({ user }: { user: ShopUser }) {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const { data: layout } = useSuspenseQuery(shopLayoutQuery)
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const wishlistCount = useWishlist((state) => state.items.length)
  const signOut = useLogout()
  const [mobileOpen, setMobileOpen] = useState(false)
  const close = () => setMobileOpen(false)
  const showWishlist = settings?.enableWishlist !== false
  const { categories, menuItems } = layout

  return (
    <header className="sticky top-0 z-40">
      {settings?.promoActive && settings.promoText && (
        <div className="bg-foreground px-4 py-2 text-center font-medium text-background text-sm">
          {settings.promoLink ? (
            <DbLink url={settings.promoLink} className="hover:underline">
              {settings.promoText}
            </DbLink>
          ) : (
            settings.promoText
          )}
        </div>
      )}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <HugeiconsIcon icon={Menu01Icon} className="size-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="space-y-4 px-4 pb-6" aria-label="Mobile">
                <SearchForm onDone={close} />
                {categories.length > 0 && (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 font-medium hover:bg-muted">
                      Categories
                      <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mt-1 space-y-0.5 pl-3">
                      {categories.map((category) => (
                        <li key={category.id}>
                          <Link
                            to="/categories/$slug"
                            params={{ slug: category.slug }}
                            className={menuLink}
                            onClick={close}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {menuItems.map((item) => (
                  <div key={item.id}>
                    <DbLink url={item.url} newTab={item.openInNewTab} className={cn(menuLink, 'font-medium')} onClick={close}>
                      {item.label}
                    </DbLink>
                    {item.children.map((child) => (
                      <DbLink
                        key={child.id}
                        url={child.url}
                        newTab={child.openInNewTab}
                        className={cn(menuLink, 'ml-3 text-muted-foreground')}
                        onClick={close}
                      >
                        {child.label}
                      </DbLink>
                    ))}
                  </div>
                ))}
                <div className="space-y-0.5 border-t pt-4">
                  {showWishlist && (
                    <Link to="/wishlist" className={menuLink} onClick={close}>
                      Wishlist
                    </Link>
                  )}
                  {user ? (
                    <>
                      <Link to="/orders" className={menuLink} onClick={close}>
                        My orders
                      </Link>
                      <button
                        type="button"
                        className={cn(menuLink, 'w-full text-left')}
                        onClick={() => {
                          close()
                          signOut()
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className={menuLink} onClick={close}>
                      Sign in
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center font-bold text-lg sm:text-xl">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.siteName} height={40} className="h-8 w-auto sm:h-10" />
            ) : (
              settings?.siteName
            )}
          </Link>

          <SearchForm className="mx-auto hidden max-w-2xl flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {user ? (
              <div className="hidden items-center gap-1 lg:flex">
                <Link to="/orders" className="flex flex-col rounded-md px-2 py-1 leading-tight hover:bg-primary-foreground/15">
                  <span className="text-xs opacity-80">Hello, {user.name}</span>
                  <span className="font-medium text-sm">Account & orders</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  onClick={signOut}
                  aria-label="Sign out"
                >
                  <HugeiconsIcon icon={Logout01Icon} />
                </Button>
              </div>
            ) : (
              <Link to="/login" className={cn(barLink, 'hidden lg:flex')}>
                <HugeiconsIcon icon={Login01Icon} className="size-5" />
                Sign in
              </Link>
            )}
            {showWishlist && <NavIconLink to="/wishlist" label="Wishlist" icon={FavouriteIcon} count={wishlistCount} />}
            <NavIconLink to="/cart" label="Cart" icon={ShoppingCart01Icon} count={cartCount} />
          </div>
        </div>

        {(categories.length > 0 || menuItems.length > 0) && (
          <nav className="hidden border-primary-foreground/20 border-t md:block" aria-label="Main">
            <div className="container mx-auto flex items-center gap-1 px-4 py-1">
              {categories.length > 0 && (
                <HoverMenu
                  wide
                  trigger={
                    <Link to="/categories" className={barLink}>
                      <HugeiconsIcon icon={GridViewIcon} className="size-4" />
                      All categories
                      <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
                    </Link>
                  }
                >
                  <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to="/categories/$slug"
                          params={{ slug: category.slug }}
                          className={cn(menuLink, 'font-medium')}
                        >
                          {category.name}
                        </Link>
                        {category.subcategories.length > 0 && (
                          <ul className="flex flex-wrap pl-2">
                            {category.subcategories.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  to="/categories/$slug"
                                  params={{ slug: category.slug }}
                                  search={{ subcategory: sub.slug }}
                                  className="block rounded-md px-2 py-1 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </HoverMenu>
              )}
              {menuItems.map((item) =>
                item.children.length > 0 ? (
                  <HoverMenu
                    key={item.id}
                    wide={item.megaMenu}
                    trigger={
                      <DbLink url={item.url} newTab={item.openInNewTab} className={barLink}>
                        {item.label}
                        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
                      </DbLink>
                    }
                  >
                    <div className={cn(item.megaMenu && 'grid gap-1 sm:grid-cols-2')}>
                      {item.children.map((child) => (
                        <DbLink key={child.id} url={child.url} newTab={child.openInNewTab} className={menuLink}>
                          {child.label}
                        </DbLink>
                      ))}
                    </div>
                  </HoverMenu>
                ) : (
                  <DbLink key={item.id} url={item.url} newTab={item.openInNewTab} className={barLink}>
                    {item.label}
                  </DbLink>
                ),
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
