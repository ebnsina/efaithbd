import {
  Call02Icon,
  Clock01Icon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  Location01Icon,
  Mail01Icon,
  NewTwitterIcon,
  PinterestIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { siteSettingsQuery } from '@/features/settings/queries'
import { DbLink } from './db-link'
import { shopLayoutQuery } from './queries'

const socialIcons = {
  facebook: Facebook01Icon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  twitter: NewTwitterIcon,
  x: NewTwitterIcon,
  linkedin: Linkedin01Icon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
  pinterest: PinterestIcon,
}

export function Footer() {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery)
  const {
    data: { footer },
  } = useSuspenseQuery(shopLayoutQuery)
  const { contact, sections, socialLinks } = footer
  const siteName = settings?.siteName

  return (
    <footer className="mt-12 border-t bg-muted/40">
      <div className="container mx-auto grid gap-10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block font-bold text-lg text-primary">
            {footer.logo ? <img src={footer.logo} alt={siteName ?? ''} height={40} className="h-10 w-auto" /> : siteName}
          </Link>
          {contact.description && (
            <p className="max-w-md whitespace-pre-line text-muted-foreground text-sm leading-relaxed">
              {contact.description.trim()}
            </p>
          )}
          <ul className="space-y-2 text-sm">
            {contact.phone && (
              <li className="flex items-center gap-2">
                <HugeiconsIcon icon={Call02Icon} className="size-4 shrink-0 text-muted-foreground" />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="font-semibold hover:text-primary">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li className="flex items-center gap-2">
                <HugeiconsIcon icon={Mail01Icon} className="size-4 shrink-0 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="break-all hover:text-primary">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2">
                <HugeiconsIcon icon={Location01Icon} className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{contact.address}</span>
              </li>
            )}
            {contact.workingHours && (
              <li className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{contact.workingHours}</span>
              </li>
            )}
          </ul>
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Follow us">
              {socialLinks.map((link) => {
                const icon = socialIcons[link.platform.trim().toLowerCase() as keyof typeof socialIcons]
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs hover:bg-primary/90"
                    >
                      {icon ? <HugeiconsIcon icon={icon} className="size-4" /> : link.platform.slice(0, 2)}
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {sections.map((section) => (
          <div key={section.id}>
            <h2 className="mb-3 font-semibold text-sm uppercase tracking-wide">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.id}>
                  <DbLink url={link.url} className="text-muted-foreground text-sm hover:text-primary">
                    {link.label}
                  </DbLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t bg-background">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 text-muted-foreground text-sm sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteName}
            {footer.copyrightText && `. ${footer.copyrightText}`}
          </p>
          {footer.paymentMethods.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2" aria-label="Payment methods">
              {footer.paymentMethods.map((src) => (
                <li key={src}>
                  <img src={src} alt="" height={24} loading="lazy" decoding="async" className="h-6 w-auto" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
