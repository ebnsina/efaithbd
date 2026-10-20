import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { prisma } from '@/server/db.server'
import { withId } from './fields'
import {
  basicSettingsSchema,
  contactInfoSchema,
  footerLinkSchema,
  footerSectionSchema,
  footerSettingsSchema,
  menuItemSchema,
  socialLinkSchema,
} from './schemas'

const byOrder = [{ order: 'asc' as const }, { createdAt: 'asc' as const }]

export const getBasicSettings = createServerFn()
  .middleware([adminMiddleware])
  .handler(() => prisma.basicSettings.findFirst())

// Single-row tables: update the first row, or create it the first time
export const saveBasicSettings = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(basicSettingsSchema)
  .handler(async ({ data }) => {
    const row = await prisma.basicSettings.findFirst({ select: { id: true } })
    return row ? prisma.basicSettings.update({ where: { id: row.id }, data }) : prisma.basicSettings.create({ data })
  })

export const getFooter = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    const [settings, contact, sections, socialLinks] = await Promise.all([
      prisma.footerSettings.findFirst(),
      prisma.contactInfo.findFirst(),
      prisma.footerSection.findMany({
        orderBy: byOrder,
        include: { links: { orderBy: byOrder } },
      }),
      prisma.socialLink.findMany({ orderBy: byOrder }),
    ])
    return { settings, contact, sections, socialLinks }
  })

export const saveFooterSettings = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(footerSettingsSchema)
  .handler(async ({ data }) => {
    const row = await prisma.footerSettings.findFirst({ select: { id: true } })
    return row ? prisma.footerSettings.update({ where: { id: row.id }, data }) : prisma.footerSettings.create({ data })
  })

export const saveContactInfo = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(contactInfoSchema)
  .handler(async ({ data }) => {
    const [contact, footer] = await Promise.all([
      prisma.contactInfo.findFirst({ select: { id: true } }),
      prisma.footerSettings.findFirst({ select: { id: true } }),
    ])
    const { description: _, ...shared } = data
    // FooterSettings repeats phone/email/address/hours; keep both in step so either one can be read
    await prisma.$transaction([
      contact ? prisma.contactInfo.update({ where: { id: contact.id }, data }) : prisma.contactInfo.create({ data }),
      footer
        ? prisma.footerSettings.update({
            where: { id: footer.id },
            data: shared,
          })
        : prisma.footerSettings.create({ data: shared }),
    ])
    return { ok: true }
  })

export const saveFooterSection = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(footerSectionSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.footerSection.update({ where: { id }, data: values })
    const last = await prisma.footerSection.aggregate({
      _max: { order: true },
    })
    return prisma.footerSection.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })

export const saveFooterLink = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(footerLinkSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.footerLink.update({ where: { id }, data: values })
    const last = await prisma.footerLink.aggregate({
      where: { sectionId: values.sectionId },
      _max: { order: true },
    })
    return prisma.footerLink.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })

export const saveSocialLink = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(socialLinkSchema))
  .handler(async ({ data: { id, values } }) => {
    if (id) return prisma.socialLink.update({ where: { id }, data: values })
    const last = await prisma.socialLink.aggregate({ _max: { order: true } })
    return prisma.socialLink.create({
      data: { ...values, order: (last._max.order ?? -1) + 1 },
    })
  })

export const getMenu = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    const [items, categories, products, pages] = await Promise.all([
      prisma.menuItem.findMany({ orderBy: byOrder }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.page.findMany({
        select: { id: true, title: true, slug: true },
        orderBy: { title: 'asc' },
      }),
    ])
    return {
      items,
      targets: {
        CATEGORY: categories.map((c) => ({
          value: c.id,
          label: c.name,
          url: `/categories/${c.slug}`,
        })),
        PRODUCT: products.map((p) => ({
          value: p.id,
          label: p.name,
          url: `/products/${p.slug}`,
        })),
        PAGE: pages.map((p) => ({
          value: p.id,
          label: p.title,
          url: `/${p.slug}`,
        })),
      },
    }
  })

// The link for category/product/page items is looked up here, never taken from the browser
async function targetUrl(type: string, targetId: string) {
  if (type === 'CATEGORY') {
    const row = await prisma.category.findUnique({
      where: { id: targetId },
      select: { slug: true },
    })
    return row && `/categories/${row.slug}`
  }
  if (type === 'PRODUCT') {
    const row = await prisma.product.findUnique({
      where: { id: targetId },
      select: { slug: true },
    })
    return row && `/products/${row.slug}`
  }
  const row = await prisma.page.findUnique({
    where: { id: targetId },
    select: { slug: true },
  })
  return row && `/${row.slug}`
}

export const saveMenuItem = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(withId(menuItemSchema))
  .handler(async ({ data: { id, values } }) => {
    const { targetId, parentId, ...rest } = values
    const custom = values.type === 'CUSTOM'
    const url = custom ? values.url : await targetUrl(values.type, targetId)
    if (!url)
      return {
        ok: false as const,
        error: 'The item this links to no longer exists. Choose another.',
      }

    // Two levels only: a parent must be a top-level item, and an item with children stays top-level
    if (parentId) {
      const parent = await prisma.menuItem.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      })
      if (!parent || parent.parentId || parentId === id) {
        return {
          ok: false as const,
          error: 'Choose a top-level item as the parent.',
        }
      }
      if (id && (await prisma.menuItem.count({ where: { parentId: id } }))) {
        return {
          ok: false as const,
          error: 'This item has its own sub-items, so it has to stay at the top level.',
        }
      }
    }

    const data = {
      ...rest,
      url,
      targetId: custom ? null : targetId,
      parentId: parentId || null,
    }
    if (id)
      return {
        ok: true as const,
        item: await prisma.menuItem.update({ where: { id }, data }),
      }
    const last = await prisma.menuItem.aggregate({
      where: { parentId: data.parentId },
      _max: { order: true },
    })
    const item = await prisma.menuItem.create({
      data: { ...data, order: (last._max.order ?? -1) + 1 },
    })
    return { ok: true as const, item }
  })
