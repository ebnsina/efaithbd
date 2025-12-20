import { prisma } from '../src/lib/prisma'

async function setupFooterLinks() {
  try {
    console.log('🌱 Setting up footer links...')

    // Delete all existing footer sections and links to start fresh
    await prisma.footerLink.deleteMany({})
    await prisma.footerSection.deleteMany({})
    console.log('🧹 Cleared existing footer sections and links')

    // Create Company section
    const companySection = await prisma.footerSection.create({
      data: {
        title: 'Company',
        order: 1,
        active: true,
      },
    })
    console.log('✅ Created Company section')

    // Create Help & Support section
    const helpSupportSection = await prisma.footerSection.create({
      data: {
        title: 'Help & Support',
        order: 2,
        active: true,
      },
    })
    console.log('✅ Created Help & Support section')

    // Create Quick Links section
    const quickLinksSection = await prisma.footerSection.create({
      data: {
        title: 'Quick Links',
        order: 3,
        active: true,
      },
    })
    console.log('✅ Created Quick Links section')

    // Company section links
    const companyLinks = [
      { label: 'About Us', url: '/about', order: 1 },
      { label: 'Contact Us', url: '/contact', order: 2 },
    ]

    // Help & Support section links
    const helpSupportLinks = [
      { label: 'FAQ', url: '/faq', order: 1 },
      { label: 'Privacy Policy', url: '/privacy-policy', order: 2 },
      { label: 'Terms & Conditions', url: '/terms', order: 3 },
    ]

    // Quick Links section links
    const quickLinks = [
      { label: 'All Products', url: '/products', order: 1 },
      { label: 'Categories', url: '/categories', order: 2 },
      { label: 'My Orders', url: '/orders', order: 3 },
    ]

    // Add Company links
    for (const link of companyLinks) {
      await prisma.footerLink.create({
        data: {
          sectionId: companySection.id,
          label: link.label,
          url: link.url,
          order: link.order,
          active: true,
        },
      })
      console.log(`✅ Created link: ${link.label} in Company`)
    }

    // Add Help & Support links
    for (const link of helpSupportLinks) {
      await prisma.footerLink.create({
        data: {
          sectionId: helpSupportSection.id,
          label: link.label,
          url: link.url,
          order: link.order,
          active: true,
        },
      })
      console.log(`✅ Created link: ${link.label} in Help & Support`)
    }

    // Add Quick Links
    for (const link of quickLinks) {
      await prisma.footerLink.create({
        data: {
          sectionId: quickLinksSection.id,
          label: link.label,
          url: link.url,
          order: link.order,
          active: true,
        },
      })
      console.log(`✅ Created link: ${link.label} in Quick Links`)
    }

    console.log('')
    console.log('✅ Footer links setup completed!')
  } catch (error) {
    console.error('❌ Error setting up footer links:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupFooterLinks()

