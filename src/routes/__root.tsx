import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { siteSettingsQuery } from '@/features/settings/queries'
import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteSettingsQuery),
  head: ({ loaderData: settings }) => {
    const title = settings?.metaTitle || settings?.siteName || ''
    const description = settings?.metaDescription || settings?.siteDescription || ''
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title },
        { name: 'description', content: description },
        ...(settings?.metaKeywords ? [{ name: 'keywords', content: settings.metaKeywords }] : []),
        { property: 'og:site_name', content: settings?.siteName ?? '' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        ...(settings?.ogImage ? [{ property: 'og:image', content: settings.ogImage }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      links: [{ rel: 'stylesheet', href: appCss }, ...(settings?.favicon ? [{ rel: 'icon', href: settings.favicon }] : [])],
    }
  },
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
        <Toaster position="top-center" richColors />
        <Scripts />
      </body>
    </html>
  )
}
