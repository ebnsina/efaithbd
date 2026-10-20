import { HelpCircleIcon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { faqsQuery } from '@/features/faq/queries'
import { EmptyState, RouteError, RoutePending } from '@/features/pages/route-states'

export const Route = createFileRoute('/_shop/faq')({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQuery),
  head: () => ({
    meta: [
      { title: 'Frequently asked questions' },
      { name: 'description', content: 'Answers to common questions about ordering, payment and delivery.' },
    ],
  }),
  pendingComponent: RoutePending,
  errorComponent: RouteError,
  component: FaqPage,
})

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqsQuery)

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-semibold text-3xl tracking-tight">Frequently asked questions</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Quick answers about ordering, payment and delivery.</p>

      {faqs.length === 0 ? (
        <EmptyState
          icon={HelpCircleIcon}
          title="No questions here yet"
          description="If you need help with anything, get in touch and we'll answer you directly."
        />
      ) : (
        <Accordion className="rounded-lg border bg-card px-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-base">{faq.question}</AccordionTrigger>
              <AccordionContent className="whitespace-pre-line text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-10 rounded-lg bg-muted p-6 text-center">
        <h2 className="font-semibold text-lg">Still have a question?</h2>
        <p className="mt-1 mb-4 text-muted-foreground text-sm">We're happy to help.</p>
        <Link to="/contact" className={buttonVariants()}>
          Contact us
        </Link>
      </div>
    </main>
  )
}
