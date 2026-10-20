import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'

// The contact page row wins; the support email and phone from site settings fill any gaps
export const getContactDetails = createServerFn().handler(async () => {
  const [info, settings] = await Promise.all([
    prisma.contactInfo.findFirst({
      select: { phone: true, email: true, address: true, workingHours: true, description: true },
    }),
    prisma.basicSettings.findFirst({ select: { supportEmail: true, supportPhone: true } }),
  ])
  return {
    phone: info?.phone || settings?.supportPhone || null,
    email: info?.email || settings?.supportEmail || null,
    address: info?.address || null,
    workingHours: info?.workingHours || null,
    description: info?.description || null,
  }
})
