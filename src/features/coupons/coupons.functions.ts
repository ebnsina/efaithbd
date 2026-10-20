import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { zonedTime } from './dates'
import { couponListSchema, saveCouponSchema } from './schemas'

const couponSelect = {
  id: true,
  code: true,
  description: true,
  type: true,
  value: true,
  minPurchase: true,
  maxDiscount: true,
  validFrom: true,
  validTo: true,
  usageLimit: true,
  usageCount: true,
  active: true,
} satisfies Prisma.CouponSelect

export const listCoupons = createServerFn()
  .middleware([adminMiddleware])
  .validator(couponListSchema)
  .handler(async ({ data: search }) => {
    const { q, status } = search
    const now = new Date()
    const where: Prisma.CouponWhereInput = {
      ...(q && {
        OR: [{ code: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }],
      }),
      ...(status === 'active' && { active: true, validTo: { gte: now } }),
      ...(status === 'inactive' && { active: false }),
      ...(status === 'expired' && { validTo: { lt: now } }),
    }
    const [rows, rowCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        select: couponSelect,
        ...toPrismaPage(search, ['code', 'value', 'usageCount', 'validFrom', 'validTo', 'createdAt'], 'createdAt'),
      }),
      prisma.coupon.count({ where }),
    ])
    return { rows, rowCount }
  })

export const saveCoupon = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(saveCouponSchema)
  .handler(async ({ data: { id, coupon } }) => {
    const code = coupon.code.toUpperCase()
    const taken = await prisma.coupon.findFirst({
      where: { code, ...(id && { id: { not: id } }) },
      select: { id: true },
    })
    if (taken)
      return {
        ok: false as const,
        field: 'code' as const,
        error: 'Another coupon already uses this code',
      }

    const settings = await prisma.basicSettings.findFirst({
      select: { timezone: true },
    })
    const timeZone = settings?.timezone ?? 'Asia/Dhaka'
    const data = {
      ...coupon,
      code,
      description: coupon.description || null,
      maxDiscount: coupon.type === 'PERCENTAGE' ? coupon.maxDiscount : null,
      validFrom: zonedTime(coupon.validFrom, '00:00:00.000', timeZone),
      validTo: zonedTime(coupon.validTo, '23:59:59.999', timeZone),
    }
    if (id) await prisma.coupon.update({ where: { id }, data, select: { id: true } })
    else await prisma.coupon.create({ data, select: { id: true } })
    return { ok: true as const }
  })

export const deleteCoupon = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.pipe(v.string(), v.nonEmpty()) }))
  .handler(async ({ data }) => {
    await prisma.coupon.delete({
      where: { id: data.id },
      select: { id: true },
    })
    return { ok: true }
  })
