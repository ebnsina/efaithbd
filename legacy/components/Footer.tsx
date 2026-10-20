import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/site-settings';

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default async function Footer() {
  const [socialLinks, contactInfo, footerSections, footerSettings, basicSettings] = await Promise.all([
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.contactInfo.findFirst(),
    prisma.footerSection.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: { links: { where: { active: true }, orderBy: { order: 'asc' } } },
    }),
    prisma.footerSettings.findFirst(),
    getSiteSettings(),
  ]);
  const siteName = basicSettings?.siteName || 'Company Name';

  return (
    <footer className="bg-gray-50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-8 sm:gap-10">
          {/* Company Info Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">{siteName}</h3>

            {contactInfo?.description && (
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{contactInfo.description}</p>
            )}

            {contactInfo?.phone && (
              <p className="text-gray-700 text-xs sm:text-sm mb-1">
                Got Question? Call us{contactInfo.workingHours ? ` ${contactInfo.workingHours}` : ''}
              </p>
            )}

            {contactInfo?.phone && (
              <a
                href={`tel:${contactInfo.phone}`}
                className="block text-gray-900 text-lg sm:text-xl font-bold mb-4 hover:text-primary"
              >
                {contactInfo.phone}
              </a>
            )}

            {/* Social Links */}
            {socialLinks?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Follow Us</p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks?.map((link) => {
                    const IconComponent = socialIcons[link.platform.toLowerCase()];
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition"
                      >
                        {IconComponent && <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Footer Sections - 3 columns for static page links */}
          {footerSections?.map((section) => (
            <div key={section.id}>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 uppercase text-xs sm:text-sm">{section.title}</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links?.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-gray-600 hover:text-primary text-xs sm:text-sm transition block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright */}
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              © {new Date().getFullYear()} {siteName}.
              {footerSettings?.copyrightText || ' All Rights Reserved'}.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
