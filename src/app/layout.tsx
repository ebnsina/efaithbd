import type { Metadata } from 'next';
import { Mona_Sans } from 'next/font/google';
import { getSiteSettings } from '@/lib/site-settings';
import './globals.css';

const fontSans = Mona_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || 'Online Store';
  
  return {
    title: settings?.metaTitle || `${siteName} - Online Shopping`,
    description:
      settings?.metaDescription || settings?.siteDescription || 'Best online shopping site',
    keywords: settings?.metaKeywords || undefined,
    openGraph: {
      title: settings?.metaTitle || `${siteName} - Online Shopping`,
      description: settings?.metaDescription || settings?.siteDescription || 'Best online shopping site',
      images: settings?.ogImage ? [settings.ogImage] : undefined,
      siteName: siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings?.metaTitle || `${siteName} - Online Shopping`,
      description: settings?.metaDescription || settings?.siteDescription || 'Best online shopping site',
      images: settings?.ogImage ? [settings.ogImage] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} antialiased font-sans`}>{children}</body>
    </html>
  );
}
