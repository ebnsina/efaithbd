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

interface FooterData {
  socialLinks: SocialLink[];
  contactInfo: ContactInfo | null;
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

  // Static footer links
  const staticLinks = {
    company: [
      { label: 'About Us', labelBn: 'আমাদের সম্পর্কে', url: '/about' },
      { label: 'Contact Us', labelBn: 'যোগাযোগ', url: '/contact' },
    ],
    help: [
      { label: 'FAQ', labelBn: 'সচরাচর জিজ্ঞাসা', url: '/faq' },
      {
        label: 'Privacy Policy',
        labelBn: 'গোপনীয়তা নীতি',
        url: '/privacy-policy',
      },
      { label: 'Terms & Conditions', labelBn: 'শর্তাবলী', url: '/terms' },
    ],
  };

  if (loading) {
    return (
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">{'Loading...'}</div>
      </footer>
    );
  }

  const { socialLinks, contactInfo } = footerData;

  return (
    <footer className="bg-gray-50 border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info Column */}
          <div>
            {contactInfo?.logo ? (
              <img src={contactInfo.logo} alt="Logo" className="h-12 w-auto mb-4" />
            ) : (
              <h3 className="text-xl font-bold text-primary mb-4">{'Company Name'}</h3>
            )}

            {contactInfo?.description && (
              <p className="text-gray-600 text-sm mb-4">{contactInfo.description}</p>
            )}

            {contactInfo?.workingHours && (
              <p className="text-gray-700 text-sm mb-2">
                <span className="font-semibold">{'Working Hours'}:</span> {contactInfo.workingHours}
              </p>
            )}

            {contactInfo?.phone && (
              <p className="text-gray-900 text-lg font-bold mb-4">{contactInfo.phone}</p>
            )}

            {/* Social Links */}
            {socialLinks?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">{'Follow Us'}</p>
                <div className="flex space-x-2">
                  {socialLinks?.map((link) => {
                    const IconComponent = socialIcons[link.platform.toLowerCase()];
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition"
                      >
                        {IconComponent && <IconComponent className="w-5 h-5" />}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Company</h3>
            <ul className="space-y-2">
              {staticLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-600 hover:text-primary text-sm transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Help & Support</h3>
            <ul className="space-y-2">
              {staticLinks.help.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="text-gray-600 hover:text-primary text-sm transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 uppercase text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-primary text-sm transition"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-gray-600 hover:text-primary text-sm transition"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-primary text-sm transition"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright & Payment Methods */}
      <div className="border-t bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} efaithbd.
              {'All Rights Reserved'}.
            </div>

            {/* Payment Methods */}
            {contactInfo?.paymentMethods && contactInfo.paymentMethods.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 mr-2">{'Secure Payment'}:</span>
                {contactInfo.paymentMethods.map((method, index) => (
                  <img
                    key={index}
                    src={method}
                    alt="Payment method"
                    className="h-8 object-contain"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
