import { useSuspenseQuery } from '@tanstack/react-query'
import { ContactInfoForm } from './contact-info-form'
import { FooterColumns } from './footer-columns'
import { FooterSettingsForm } from './footer-settings-form'
import { footerQuery } from './queries'
import { SocialLinks } from './social-links'

export function FooterTab() {
  const { data } = useSuspenseQuery(footerQuery())
  return (
    <div className="space-y-6">
      <ContactInfoForm contact={data.contact} settings={data.settings} />
      <FooterColumns sections={data.sections} />
      <SocialLinks links={data.socialLinks} />
      <FooterSettingsForm settings={data.settings} />
    </div>
  )
}
