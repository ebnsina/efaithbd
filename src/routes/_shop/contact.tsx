import { CallIcon, Clock01Icon, Location01Icon, Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { contactQuery } from '@/features/contact/queries'
import { EmptyState, RouteError, RoutePending } from '@/features/pages/route-states'

export const Route = createFileRoute('/_shop/contact')({
  loader: ({ context }) => context.queryClient.ensureQueryData(contactQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: 'Contact us' },
      ...(loaderData?.description ? [{ name: 'description', content: loaderData.description }] : []),
    ],
  }),
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  component: ContactPage,
})

function ContactPage() {
  const { data: contact } = useSuspenseQuery(contactQuery)
  const hasAny = contact.phone || contact.email || contact.address || contact.workingHours

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-semibold text-3xl tracking-tight">Contact us</h1>
      <p className="mt-2 mb-8 whitespace-pre-line text-muted-foreground">
        {contact.description || 'Questions about an order or a product? Reach us any of these ways.'}
      </p>

      {hasAny ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {contact.phone && (
            <ContactCard icon={CallIcon} label="Phone">
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
                {contact.phone}
              </a>
            </ContactCard>
          )}
          {contact.email && (
            <ContactCard icon={Mail01Icon} label="Email">
              <a href={`mailto:${contact.email}`} className="break-all hover:underline">
                {contact.email}
              </a>
            </ContactCard>
          )}
          {contact.address && (
            <ContactCard icon={Location01Icon} label="Address">
              <span className="whitespace-pre-line">{contact.address}</span>
            </ContactCard>
          )}
          {contact.workingHours && (
            <ContactCard icon={Clock01Icon} label="Opening hours">
              <span className="whitespace-pre-line">{contact.workingHours}</span>
            </ContactCard>
          )}
        </div>
      ) : (
        <EmptyState
          icon={CallIcon}
          title="Contact details are coming soon"
          description="We're still adding our contact details. Please check back shortly."
        />
      )}
    </div>
  )
}

function ContactCard({ icon, label, children }: { icon: IconSvgElement; label: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex-row items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon} className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          <div className="font-medium">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}
