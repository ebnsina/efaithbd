import { useAppForm } from '@/components/form'
import { type Footer, settingsKeys, useSave } from './queries'
import { type ContactInfoInput, contactInfoSchema } from './schemas'
import { saveContactInfo } from './settings.functions'
import { SettingsCard } from './settings-card'

// Falls back to the footer's copy of the details until contact details are saved once
export function ContactInfoForm({ contact, settings }: Pick<Footer, 'contact' | 'settings'>) {
  const save = useSave((values: ContactInfoInput) => saveContactInfo({ data: values }), {
    invalidate: [settingsKeys.footer()],
    success: 'Contact details saved',
    failure: 'Could not save your contact details. Please check the fields and try again.',
  })
  const form = useAppForm({
    defaultValues: {
      phone: contact?.phone ?? settings?.phone ?? '',
      email: contact?.email ?? settings?.email ?? '',
      address: contact?.address ?? settings?.address ?? '',
      workingHours: contact?.workingHours ?? settings?.workingHours ?? '',
      description: contact?.description ?? '',
    } satisfies ContactInfoInput,
    validators: { onSubmit: contactInfoSchema },
    onSubmit: async ({ value }) => {
      await save.mutateAsync(value).catch(() => null)
    },
  })

  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <SettingsCard title="Contact details" description="Shown in the footer and on your contact page.">
        <div className="grid gap-6 md:grid-cols-2">
          <form.AppField name="phone">
            {(field) => <field.TextField label="Phone" type="tel" placeholder="+8801712345678" />}
          </form.AppField>
          <form.AppField name="email">{(field) => <field.TextField label="Email" type="email" />}</form.AppField>
        </div>
        <form.AppField name="address">{(field) => <field.TextareaField label="Address" rows={2} />}</form.AppField>
        <form.AppField name="workingHours">
          {(field) => <field.TextField label="Opening hours" placeholder="Saturday to Thursday, 10am to 8pm" />}
        </form.AppField>
        <form.AppField name="description">
          {(field) => <field.TextareaField label="A line about your shop" rows={2} />}
        </form.AppField>
        <div className="flex justify-end [&>*]:sm:w-48">
          <form.AppForm>
            <form.SubmitButton label="Save contact details" pendingLabel="Saving…" />
          </form.AppForm>
        </div>
      </SettingsCard>
    </form>
  )
}
