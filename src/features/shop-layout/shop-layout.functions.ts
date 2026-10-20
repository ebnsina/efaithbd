import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'
import { getSessionUser } from '@/server/session.server'

export const getShopLayout = createServerFn().handler(async () => {
  const [menuItems, categories, footerSections, socialLinks, contactInfo, footerSettings] = await Promise.all([
    prisma.menuItem.findMany({
      where: { active: true, parentId: null },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        label: true,
        url: true,
        openInNewTab: true,
        megaMenu: true,
        children: {
          where: { active: true },
          orderBy: { order: 'asc' },
          select: { id: true, label: true, url: true, openInNewTab: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        subcategories: { orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.footerSection.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        links: { where: { active: true }, orderBy: { order: 'asc' }, select: { id: true, label: true, url: true } },
      },
    }),
    prisma.socialLink.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, platform: true, url: true },
    }),
    prisma.contactInfo.findFirst({
      select: { phone: true, email: true, address: true, workingHours: true, description: true },
    }),
    prisma.footerSettings.findFirst({
      select: {
        logo: true,
        description: true,
        copyrightText: true,
        phone: true,
        email: true,
        address: true,
        workingHours: true,
        paymentMethods: true,
        showPaymentMethods: true,
      },
    }),
  ])
  // Contact details can be filled in either admin tab; the contact tab wins when both are set
  const contact = {
    phone: contactInfo?.phone || footerSettings?.phone || null,
    email: contactInfo?.email || footerSettings?.email || null,
    address: contactInfo?.address || footerSettings?.address || null,
    workingHours: contactInfo?.workingHours || footerSettings?.workingHours || null,
    description: contactInfo?.description || footerSettings?.description || null,
  }
  return {
    menuItems,
    categories,
    footer: {
      sections: footerSections.filter((section) => section.links.length > 0),
      socialLinks,
      contact,
      logo: footerSettings?.logo ?? null,
      copyrightText: footerSettings?.copyrightText ?? null,
      paymentMethods: footerSettings?.showPaymentMethods ? footerSettings.paymentMethods : [],
    },
  }
})

// Only what the storefront shows; the rest of the session user stays on the server
export const getShopUser = createServerFn().handler(async () => {
  const user = await getSessionUser()
  return user ? { name: user.name, isAdmin: user.role === 'ADMIN' } : null
})
