import 'dotenv/config'
import { prisma } from '../src/server/db.server'

// One-off: moves the content that used to be hard-coded in the storefront into the database.
// Safe to re-run: pages upsert by slug, FAQs and highlights are only inserted into empty tables.

const pages = [
  {
    slug: 'about',
    title: 'About Us',
    content: `{siteName} is Bangladesh's most trusted online shopping platform. We serve thousands of customers daily and deliver the best quality products to them.

## Our Mission

Our mission is to deliver high-quality products to every person in Bangladesh easily and at affordable prices. We believe that every customer deserves the best service and quality products.

## Our Values

- Customer satisfaction is our top priority
- Delivering quality products
- Ensuring timely delivery
- Transparency and trustworthiness
- Fair pricing

## Why Choose Us?

We don't just sell products, we build trusted relationships. We have a skilled customer support team that is always ready to serve you. Each of your orders is carefully packaged and safely delivered to you.

## Get in Touch

Want to contact us? We are always eager to hear your questions and feedback.`,
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    content: `By using our website, you agree to the following terms and conditions. Please read these terms carefully.

## 1. General Terms

By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement.

## 2. Products & Pricing

All product descriptions, images, and prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time.

## 3. Orders

We reserve the right to refuse or cancel any order for any reason.

## 4. Returns & Refunds

Returns are accepted within 7 days of delivery for defective or damaged products.`,
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `We take your privacy seriously. This privacy policy explains how we collect, use, and protect your information.

## Information Collection

We collect information you provide when creating an account, placing orders, or contacting us. This may include your name, email, phone number, and shipping address.

## How We Use Your Information

We use your information to process orders, communicate with you, improve our services, and send promotional materials if you've opted in.

## Data Security

We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.

## Cookies

We use cookies to enhance your browsing experience and analyze site traffic.

## Your Rights

You have the right to access, modify, or delete your personal information at any time by contacting us.`,
  },
]

const faqs = [
  ['How do I place an order?', 'Browse our products, add items to your cart, then proceed to checkout. Fill in your delivery details and choose your payment method to complete the order.'],
  ['What payment methods do you accept?', 'We accept Cash on Delivery (COD) and bKash payments. For bKash, you need to send money to our provided number and enter the transaction ID during checkout.'],
  ['How long does delivery take?', 'Delivery typically takes 3-7 business days depending on your location. We will notify you once your order is shipped.'],
  ['Can I cancel my order?', 'Orders can be cancelled before they are processed. Please contact us immediately after placing your order if you wish to cancel it.'],
  ['What is your return policy?', 'If you receive a damaged or defective product, please contact us within 7 days of delivery. We will replace the product or provide a refund.'],
  ['How can I track my order?', 'After your order is shipped, you will receive a notification. You can track your order status from your account dashboard.'],
  ['Do you deliver outside Dhaka?', 'Yes, we deliver all over Bangladesh. Delivery charges may vary based on your location.'],
  ['Are the products original?', 'Yes, we guarantee that all our products are 100% original and authentic. We work directly with authorized distributors and brands.'],
  ['Can I change my delivery address after placing an order?', 'You can change your delivery address before the order is processed. Please contact our customer support immediately.'],
  ['What if the product is out of stock?', 'If a product goes out of stock after you place an order, we will notify you immediately and offer a refund or alternative product.'],
]

async function main() {
  const settings = await prisma.basicSettings.findFirst()
  const siteName = settings?.siteName?.trim() ?? ''

  for (const page of pages) {
    const content = page.content.replace('{siteName}', siteName)
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: { ...page, content } })
  }

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: faqs.map(([question, answer], order) => ({ question, answer, order })) })
  }

  if ((await prisma.highlight.count()) === 0) {
    const phone = settings?.supportPhone
    await prisma.highlight.createMany({
      data: [
        { icon: 'delivery', title: 'Fast Delivery', subtitle: 'All over Bangladesh', link: '/faq' },
        { icon: 'returns', title: 'Cancellation & Returns', subtitle: 'Easy return policy', link: '/terms' },
        { icon: 'shield', title: 'Privacy Policy', subtitle: 'Your data stays safe', link: '/privacy-policy' },
        { icon: 'support', title: 'Customer Support', subtitle: phone ? `Call us at ${phone}` : 'We are here to help', link: '/contact' },
      ].map((item, order) => ({ ...item, order })),
    })
  }

  console.log('Pages:', await prisma.page.count(), 'FAQs:', await prisma.faq.count(), 'Highlights:', await prisma.highlight.count())
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
