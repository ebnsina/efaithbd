import {
  ArrowUpRight01Icon,
  CheckListIcon,
  CouponPercentIcon,
  DashboardSquare02Icon,
  DeliveryTruck01Icon,
  File01Icon,
  HelpCircleIcon,
  Home01Icon,
  Image01Icon,
  Layers01Icon,
  Logout01Icon,
  MessageQuestionIcon,
  PackageIcon,
  Settings02Icon,
  ShoppingBag01Icon,
  SparklesIcon,
  StarIcon,
  UnfoldMoreIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { logout } from '@/features/auth/auth.functions'
import type { SessionUser } from '@/server/session.server'

const groups = [
  { label: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: DashboardSquare02Icon, exact: true }] },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag01Icon },
      { to: '/admin/customers', label: 'Customers', icon: UserMultipleIcon },
      { to: '/admin/coupons', label: 'Coupons', icon: CouponPercentIcon },
      { to: '/admin/shipping-methods', label: 'Shipping Methods', icon: DeliveryTruck01Icon },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: PackageIcon },
      { to: '/admin/categories', label: 'Categories', icon: Layers01Icon },
      { to: '/admin/reviews', label: 'Reviews', icon: StarIcon },
      { to: '/admin/questions', label: 'Q&A', icon: MessageQuestionIcon },
    ],
  },
  {
    label: 'Storefront',
    items: [
      { to: '/admin/homepage', label: 'Homepage', icon: Home01Icon },
      { to: '/admin/banners', label: 'Banners', icon: Image01Icon },
      { to: '/admin/highlights', label: 'Highlights', icon: SparklesIcon },
      { to: '/admin/pages', label: 'Pages', icon: File01Icon },
      { to: '/admin/faqs', label: 'FAQs', icon: HelpCircleIcon },
      { to: '/admin/site-settings', label: 'Site Settings', icon: Settings02Icon },
    ],
  },
] as const

export function AdminLayout({ user, siteName, children }: { user: SessionUser; siteName: string; children: ReactNode }) {
  const router = useRouter()
  const signOut = async () => {
    await logout()
    await router.navigate({ to: '/auth/admin-login' })
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="gap-3 p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={CheckListIcon} className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold">Admin</div>
              <div className="truncate text-muted-foreground text-xs">{siteName}</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <Link to={item.to} activeOptions={{ exact: 'exact' in item }}>
                        {({ isActive }) => (
                          <SidebarMenuButton isActive={isActive} render={<span />}>
                            <HugeiconsIcon icon={item.icon} />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        )}
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton size="lg" aria-label="Account menu" />}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="grid min-w-0 flex-1 text-left leading-tight">
                    <span className="truncate font-medium text-sm">{user.name}</span>
                    <span className="truncate text-muted-foreground text-xs">{user.email}</span>
                  </span>
                  <HugeiconsIcon icon={UnfoldMoreIcon} className="ml-auto size-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-(--anchor-width) min-w-56">
                  {/* biome-ignore lint/a11y/useAnchorContent: the item's children become the link content via render */}
                  <DropdownMenuItem render={<a href="/" target="_blank" rel="noreferrer" />}>
                    <HugeiconsIcon icon={ArrowUpRight01Icon} />
                    Visit site
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={signOut}>
                    <HugeiconsIcon icon={Logout01Icon} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="admin-compact min-w-0">
        <header className="flex h-12 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold">Admin</span>
        </header>
        <div className="mx-auto w-full max-w-7xl p-4 pb-24 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
