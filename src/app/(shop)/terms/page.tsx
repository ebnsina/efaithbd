import { getSiteSettings } from '@/lib/site-settings'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'Online Store'
  
  return {
    title: `Terms & Conditions - ${siteName}`,
    description: `Terms and Conditions for ${siteName}. Please read these terms carefully.`,
  }
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-gray-600 mb-8">Last updated: December 5, 2025</p>

      <div className="prose prose-lg max-w-none space-y-6">
        <p className="text-gray-700 leading-relaxed">
          By using our website, you agree to the following terms and conditions.
          Please read these terms carefully.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. General Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          By accessing and using this website, you accept and agree to be bound
          by the terms and conditions of this agreement.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Products & Pricing</h2>
        <p className="text-gray-700 leading-relaxed">
          All product descriptions, images, and prices are subject to change
          without notice. We reserve the right to modify or discontinue any
          product at any time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Orders</h2>
        <p className="text-gray-700 leading-relaxed">
          We reserve the right to refuse or cancel any order for any reason.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Returns & Refunds</h2>
        <p className="text-gray-700 leading-relaxed">
          Returns are accepted within 7 days of delivery for defective or
          damaged products.
        </p>
      </div>
    </div>
  )
}
