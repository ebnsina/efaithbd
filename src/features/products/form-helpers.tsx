import type { AnyFormApi } from '@tanstack/react-form'
import { type ErrorComponentProps, Link, useBlocker, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button, buttonVariants } from '@/components/ui/button'

// Shows server-side field errors (taken slug, unknown category…) under the matching fields
export function applyServerErrors(form: AnyFormApi, result: { error: string; fieldErrors?: Record<string, string> }) {
  if (result.fieldErrors) {
    const fields = Object.fromEntries(Object.entries(result.fieldErrors).map(([name, message]) => [name, { message }]))
    form.setErrorMap({ onSubmit: { fields } })
  }
  toast.error(result.error)
}

export function LeaveGuard({ isDirty }: { isDirty: () => boolean }) {
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: isDirty,
    enableBeforeUnload: isDirty,
    withResolver: true,
  })
  return (
    <ConfirmDialog
      open={status === 'blocked'}
      onOpenChange={(open) => !open && status === 'blocked' && reset?.()}
      title="Leave without saving?"
      description="You have changes that haven't been saved. If you leave now, they will be lost."
      confirmLabel="Leave"
      onConfirm={() => proceed?.()}
    />
  )
}

type BackLink = { to: '/admin/products' | '/admin/categories'; label: string }

function Message({ text, back, children }: { text: string; back: BackLink; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted-foreground">{text}</p>
      <div className="flex gap-2">
        {children}
        <Link to={back.to} className={buttonVariants({ variant: 'outline' })}>
          {back.label}
        </Link>
      </div>
    </div>
  )
}

export const formNotFound = (text: string, back: BackLink) => () => <Message text={text} back={back} />

export const formLoadError = (back: BackLink) =>
  function LoadError({ reset }: ErrorComponentProps) {
    const router = useRouter()
    return (
      <Message text="This page could not be loaded. Check your connection and try again." back={back}>
        <Button
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          Try again
        </Button>
      </Message>
    )
  }
