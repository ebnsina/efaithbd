import { useAppForm } from '@/components/form'
import { type Footer, settingsKeys, useSave } from './queries'
import { type FooterSettingsInput, footerSettingsSchema } from './schemas'
import { saveFooterSettings } from './settings.functions'
import { SaveBar, SettingsCard } from './settings-card'

export function FooterSettingsForm({ settings: s }: { settings: Footer['settings'] }) {
  const save = useSave((values: FooterSettingsInput) => saveFooterSettings({ data: values }), {
    invalidate: [settingsKeys.footer()],
    success: 'Footer saved',
    failure: 'Could not save the footer. Please check the fields and try again.',
  })
  const form = useAppForm({
    defaultValues: {
      logo: s?.logo ?? '',
      description: s?.description ?? '',
      copyrightText: s?.copyrightText ?? '',
      paymentMethods: s?.paymentMethods ?? [],
      showPaymentMethods: s?.showPaymentMethods ?? true,
      enableNewsletter: s?.enableNewsletter ?? true,
      newsletterTitle: s?.newsletterTitle ?? '',
      newsletterText: s?.newsletterText ?? '',
      backgroundColor: s?.backgroundColor ?? '#1a1a1a',
      textColor: s?.textColor ?? '#ffffff',
    } satisfies FooterSettingsInput,
    validators: { onSubmit: footerSettingsSchema },
    onSubmit: async ({ value }) => {
      await save.mutateAsync(value).catch(() => null)
    },
  })

  return (
    <form
      method="post"
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <SettingsCard title="Footer" description="The block at the bottom of every page.">
        <form.AppField name="logo">{(field) => <field.ImageField label="Footer logo" />}</form.AppField>
        <form.AppField name="description">{(field) => <field.TextareaField label="About text" rows={3} />}</form.AppField>
        <form.AppField name="copyrightText">
          {(field) => (
            <field.TextField
              label="Copyright line"
              placeholder="All rights reserved"
              description="Shown after © year and your store name."
            />
          )}
        </form.AppField>
        <div className="grid gap-6 sm:grid-cols-2">
          {(['backgroundColor', 'textColor'] as const).map((name) => (
            <form.AppField key={name} name={name}>
              {(field) => <field.ColorField label={name === 'backgroundColor' ? 'Background colour' : 'Text colour'} />}
            </form.AppField>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Newsletter" description="A sign-up box in the footer.">
        <form.AppField name="enableNewsletter">
          {(field) => <field.SwitchField label="Show the newsletter sign-up" />}
        </form.AppField>
        <form.AppField name="newsletterTitle">{(field) => <field.TextField label="Heading" />}</form.AppField>
        <form.AppField name="newsletterText">{(field) => <field.TextareaField label="Text" rows={2} />}</form.AppField>
      </SettingsCard>

      <SettingsCard title="Payment logos" description="Logos of the ways shoppers can pay, like bKash or cash on delivery.">
        <form.AppField name="showPaymentMethods">
          {(field) => <field.SwitchField label="Show payment logos" />}
        </form.AppField>
        <form.AppField name="paymentMethods">
          {(field) => <field.ImageField label="Logos" multiple maxImages={12} />}
        </form.AppField>
      </SettingsCard>

      <SaveBar>
        <form.AppForm>
          <form.SubmitButton label="Save footer" pendingLabel="Saving…" />
        </form.AppForm>
      </SaveBar>
    </form>
  )
}
