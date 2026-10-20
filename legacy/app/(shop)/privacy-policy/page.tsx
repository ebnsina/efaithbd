import { getSiteSettings } from '@/lib/site-settings'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: `Privacy Policy - ${siteName}`,
    description: `Privacy Policy for ${siteName}. Learn how we collect, use, and protect your information.`,
  }
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: December 5, 2025</p>

      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-700 leading-relaxed">
          We take your privacy seriously. This privacy policy explains how we
          collect, use, and protect your information.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Information Collection</h2>
        <p className="text-gray-700 leading-relaxed">
          We collect information you provide when creating an account, placing
          orders, or contacting us. This may include your name, email, phone
          number, and shipping address.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
        <p className="text-gray-700 leading-relaxed">
          We use your information to process orders, communicate with you,
          improve our services, and send promotional materials if you've opted
          in.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
        <p className="text-gray-700 leading-relaxed">
          We implement appropriate security measures to protect your personal
          information from unauthorized access or disclosure.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
        <p className="text-gray-700 leading-relaxed">
          We use cookies to enhance your browsing experience and analyze site
          traffic.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p className="text-gray-700 leading-relaxed">
          You have the right to access, modify, or delete your personal
          information at any time by contacting us.
        </p>
      </div>
    </div>
  )
}
