import { useSuspenseQuery } from '@tanstack/react-query'
import { useAppForm } from '@/components/form'
import { basicSettingsQuery, settingsKeys, useSave } from './queries'
import { type BasicSettingsInput, basicSettingsSchema } from './schemas'
import { saveBasicSettings } from './settings.functions'
import { SaveBar, SettingsCard } from './settings-card'

export function BasicSettingsForm() {
  const { data: s } = useSuspenseQuery(basicSettingsQuery())
  const save = useSave((values: BasicSettingsInput) => saveBasicSettings({ data: values }), {
    invalidate: [settingsKeys.basic(), ['site-settings']],
    success: 'Settings saved',
    failure: 'Could not save your settings. Please check the fields and try again.',
  })
  const form = useAppForm({
    defaultValues: {
      siteName: s?.siteName ?? '',
      siteDescription: s?.siteDescription ?? '',
      logo: s?.logo ?? '',
      favicon: s?.favicon ?? '',
      promoActive: s?.promoActive ?? false,
      promoText: s?.promoText ?? '',
      promoLink: s?.promoLink ?? '',
      metaTitle: s?.metaTitle ?? '',
      metaDescription: s?.metaDescription ?? '',
      metaKeywords: s?.metaKeywords ?? '',
      ogImage: s?.ogImage ?? '',
      supportEmail: s?.supportEmail ?? '',
      supportPhone: s?.supportPhone ?? '',
      currency: s?.currency ?? 'BDT',
      currencySymbol: s?.currencySymbol ?? '৳',
      timezone: s?.timezone ?? 'Asia/Dhaka',
      enableWishlist: s?.enableWishlist ?? true,
      enableReviews: s?.enableReviews ?? true,
      enableCoupons: s?.enableCoupons ?? true,
      bkashNumber: s?.bkashNumber ?? '',
      bkashNote: s?.bkashNote ?? '',
    } satisfies BasicSettingsInput,
    validators: { onSubmit: basicSettingsSchema },
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
      <SettingsCard title="Store" description="Your store's name and look.">
        <form.AppField name="siteName">{(field) => <field.TextField label="Store name" />}</form.AppField>
        <form.AppField name="siteDescription">
          {(field) => <field.TextareaField label="Short description" rows={2} />}
        </form.AppField>
        <div className="grid gap-6 md:grid-cols-2">
          <form.AppField name="logo">{(field) => <field.ImageField label="Logo" />}</form.AppField>
          <form.AppField name="favicon">
            {(field) => <field.ImageField label="Browser tab icon (favicon)" />}
          </form.AppField>
        </div>
      </SettingsCard>

      <SettingsCard title="Announcement bar" description="A short message in a bar at the very top of every page.">
        <form.AppField name="promoActive">{(field) => <field.SwitchField label="Show the bar" />}</form.AppField>
        <form.AppField name="promoText">
          {(field) => <field.TextField label="Message" placeholder="Free delivery on orders over ৳1000" />}
        </form.AppField>
        <form.AppField name="promoLink">
          {(field) => (
            <field.TextField
              label="Link"
              placeholder="/products"
              description="Optional. Where shoppers go when they tap the bar."
            />
          )}
        </form.AppField>
      </SettingsCard>

      <SettingsCard
        title="Search engines and sharing"
        description="How your store appears in Google and when a link is shared on Facebook or WhatsApp."
      >
        <form.AppField name="metaTitle">
          {(field) => (
            <field.TextField label="Title" description="Up to 70 characters. Leave empty to use the store name." />
          )}
        </form.AppField>
        <form.AppField name="metaDescription">
          {(field) => <field.TextareaField label="Description" rows={2} description="Up to 160 characters." />}
        </form.AppField>
        <form.AppField name="metaKeywords">
          {(field) => (
            <field.TextField
              label="Keywords"
              placeholder="islamic books, attar, prayer mat"
              description="Separate with commas."
            />
          )}
        </form.AppField>
        <form.AppField name="ogImage">
          {(field) => <field.ImageField label="Image shown when a link is shared" />}
        </form.AppField>
      </SettingsCard>

      <SettingsCard title="Customer support" description="Where shoppers can reach you.">
        <div className="grid gap-6 md:grid-cols-2">
          <form.AppField name="supportEmail">
            {(field) => <field.TextField label="Email" type="email" autoComplete="off" />}
          </form.AppField>
          <form.AppField name="supportPhone">
            {(field) => <field.TextField label="Phone" type="tel" placeholder="+8801712345678" />}
          </form.AppField>
        </div>
      </SettingsCard>

      <SettingsCard title="Currency and time">
        <div className="grid gap-6 md:grid-cols-3">
          <form.AppField name="currency">
            {(field) => <field.TextField label="Currency code" placeholder="BDT" maxLength={3} />}
          </form.AppField>
          <form.AppField name="currencySymbol">
            {(field) => <field.TextField label="Symbol shown with prices" placeholder="৳" />}
          </form.AppField>
          <form.AppField name="timezone">
            {(field) => <field.TextField label="Time zone" placeholder="Asia/Dhaka" />}
          </form.AppField>
        </div>
      </SettingsCard>

      <SettingsCard title="bKash payment" description="Shown at checkout when a shopper pays with bKash.">
        <form.AppField name="bkashNumber">
          {(field) => <field.TextField label="bKash number" type="tel" placeholder="01XXXXXXXXX" />}
        </form.AppField>
        <form.AppField name="bkashNote">
          {(field) => (
            <field.TextareaField
              label="Instructions"
              rows={2}
              placeholder="Send money to this number and enter the transaction ID below."
            />
          )}
        </form.AppField>
      </SettingsCard>

      <SettingsCard title="Store features" description="Turn parts of the store on or off.">
        <form.AppField name="enableWishlist">
          {(field) => <field.SwitchField label="Wishlist" description="Shoppers can save products for later." />}
        </form.AppField>
        <form.AppField name="enableReviews">
          {(field) => <field.SwitchField label="Reviews" description="Shoppers can rate and review products." />}
        </form.AppField>
        <form.AppField name="enableCoupons">
          {(field) => <field.SwitchField label="Coupons" description="Shoppers can enter a coupon code at checkout." />}
        </form.AppField>
      </SettingsCard>

      <SaveBar>
        <form.AppForm>
          <form.SubmitButton label="Save settings" pendingLabel="Saving…" />
        </form.AppForm>
      </SaveBar>
    </form>
  )
}
