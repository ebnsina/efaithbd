import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'

// The contact page row wins; site settings and the footer fill any gaps, so this page never shows less than the footer
export const getContactDetails = createServerFn().handler(async () => {
  const [info, settings, footer] = await Promise.all([
    prisma.contactInfo.findFirst({
      select: { phone: true, email: true, address: true, workingHours: true, description: true },
    }),
    prisma.basicSettings.findFirst({ select: { supportEmail: true, supportPhone: true } }),
    prisma.footerSettings.findFirst({ select: { phone: true, email: true, address: true, workingHours: true } }),
  ])
  return {
    phone: info?.phone || settings?.supportPhone || footer?.phone || null,
    email: info?.email || settings?.supportEmail || footer?.email || null,
    address: info?.address || footer?.address || null,
    workingHours: info?.workingHours || footer?.workingHours || null,
    description: info?.description || null,
  }
})
