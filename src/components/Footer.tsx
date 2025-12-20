'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string | null;
  order: number;
}

interface ContactInfo {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  workingHours?: string | null;
  logo?: string | null;
  description?: string | null;
  paymentMethods: string[];
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
  order: number;
}

interface FooterSection {
  id: string;
  title: string;
  order: number;
  links: FooterLink[];
}

interface FooterData {
  socialLinks: SocialLink[];
  contactInfo: ContactInfo | null;
  footerSections: FooterSection[];
  footerSettings: {
    copyrightText?: string | null;
  } | null;
  siteName: string;
}

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>({
    socialLinks: [],
    contactInfo: null,
    footerSections: [],
    footerSettings: null,
    siteName: 'Company Name',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/footer')
      .then((res) => res.json())
      .then((data) => {
        setFooterData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching footer data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">{'Loading...'}</div>
      </footer>
    );
  }

  const { socialLinks, contactInfo, footerSections, footerSettings, siteName } = footerData;

  return (
    <footer className="bg-gray-50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            {contactInfo?.logo ? (
              <img src={contactInfo.logo} alt="Logo" className="h-10 sm:h-12 w-auto mb-3 sm:mb-4" />
            ) : (
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">{siteName}</h3>
            )}

            {contactInfo?.description && (
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{contactInfo.description}</p>
            )}

            {contactInfo?.workingHours && (
              <p className="text-gray-700 text-xs sm:text-sm mb-2">
                <span className="font-semibold">Working Hours:</span> {contactInfo.workingHours}
              </p>
            )}

            {contactInfo?.phone && (
              <p className="text-gray-900 text-base sm:text-lg font-bold mb-3 sm:mb-4">{contactInfo.phone}</p>
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

      {/* Bottom Bar - Copyright & Payment Methods */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright */}
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              © {new Date().getFullYear()} {siteName}.
              {footerSettings?.copyrightText || ' All Rights Reserved'}.
            </div>

            {/* Payment Methods */}
            {contactInfo?.paymentMethods && contactInfo.paymentMethods.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Secure Payment:</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {contactInfo.paymentMethods.map((method, index) => (
                    <img
                      key={index}
                      src={method}
                      alt="Payment method"
                      className="h-6 sm:h-8 object-contain"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
