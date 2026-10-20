import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import * as v from 'valibot'
import { PageHeader } from '@/components/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BasicSettingsForm } from '@/features/site-settings/basic-settings-form'
import { FooterTab } from '@/features/site-settings/footer-tab'
import { MenuTab } from '@/features/site-settings/menu-tab'
import { basicSettingsQuery, footerQuery, menuQuery } from '@/features/site-settings/queries'

const tabs = ['basic', 'menu', 'footer'] as const
const searchSchema = v.object({
  tab: v.optional(v.fallback(v.picklist(tabs), 'basic'), 'basic'),
})

export const Route = createFileRoute('/admin/site-settings/')({
  validateSearch: searchSchema,
  search: { middlewares: [stripSearchParams({ tab: 'basic' })] },
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(basicSettingsQuery()),
      queryClient.ensureQueryData(menuQuery()),
      queryClient.ensureQueryData(footerQuery()),
    ]),
  head: () => ({ meta: [{ title: 'Site settings' }] }),
  component: SiteSettingsPage,
})

function SiteSettingsPage() {
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Site settings" description="Your store's details, main menu and footer." />
      <Tabs
        value={tab}
        onValueChange={(next) =>
          navigate({
            search: { tab: next as (typeof tabs)[number] },
            replace: true,
          })
        }
      >
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basics</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <BasicSettingsForm />
        </TabsContent>
        <TabsContent value="menu">
          <MenuTab />
        </TabsContent>
        <TabsContent value="footer">
          <FooterTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
