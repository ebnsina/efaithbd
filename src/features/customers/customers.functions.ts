import { createServerFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { adminCustomerSearchSchema, newCustomerSchema, type SaveResult, updateCustomerSchema } from './schemas'

export const listAdminCustomers = createServerFn()
  .middleware([adminMiddleware])
  .validator(adminCustomerSearchSchema)
  .handler(async ({ data: search }) => {
    const { q, role } = search
    const where: Prisma.UserWhereInput = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      }),
      ...(role && { role }),
    }
    const page = toPrismaPage(search, ['name', 'createdAt', 'orders'], 'createdAt')
    const [rows, rowCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        ...page,
        orderBy: 'orders' in page.orderBy ? { orders: { _count: page.orderBy.orders } } : page.orderBy,
      }),
      prisma.user.count({ where }),
    ])
    return { rows, rowCount }
  })

const customerDetailSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  orders: {
    select: { id: true, orderNumber: true, createdAt: true, total: true, orderStatus: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  },
  _count: { select: { orders: true, reviews: true, questions: true } },
} satisfies Prisma.UserSelect

export type AdminCustomerDetail = Prisma.UserGetPayload<{ select: typeof customerDetailSelect }>

export const getAdminCustomer = createServerFn()
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(({ data }) => prisma.user.findUnique({ where: { id: data.id }, select: customerDetailSelect }))

const emailTaken: SaveResult = {
  ok: false,
  error: 'Please fix the highlighted fields',
  fieldErrors: { email: 'Another account already uses this email' },
}
const isUniqueError = (error: unknown) => (error as { code?: string })?.code === 'P2002'
const lastAdmin = 'This is the only admin account. Make another account an admin first.'

export const createCustomer = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(newCustomerSchema)
  .handler(async ({ data }): Promise<SaveResult> => {
    if (await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })) return emailTaken
    try {
      const user = await prisma.user.create({
        data: { ...data, phone: data.phone || null, password: await bcrypt.hash(data.password, 10) },
        select: { id: true },
      })
      return { ok: true, id: user.id }
    } catch (error) {
      if (isUniqueError(error)) return emailTaken
      throw error
    }
  })

export const updateCustomer = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateCustomerSchema)
  .handler(async ({ data: { id, values }, context }): Promise<SaveResult> => {
    const current = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (!current) return { ok: false, error: 'This account no longer exists. It may have been deleted.' }
    if (current.role === 'ADMIN' && values.role !== 'ADMIN') {
      if (id === context.user.id) return { ok: false, error: 'You can’t remove your own admin access.' }
      if ((await prisma.user.count({ where: { role: 'ADMIN' } })) <= 1) return { ok: false, error: lastAdmin }
    }
    const taken = await prisma.user.findFirst({ where: { email: values.email, NOT: { id } }, select: { id: true } })
    if (taken) return emailTaken
    const { password, ...account } = values
    try {
      await prisma.user.update({
        where: { id },
        data: {
          ...account,
          phone: account.phone || null,
          ...(password && { password: await bcrypt.hash(password, 10) }),
        },
      })
      return { ok: true, id }
    } catch (error) {
      if (isUniqueError(error)) return emailTaken
      throw error
    }
  })

export const deleteCustomer = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(async ({ data, context }) => {
    if (data.id === context.user.id) return { ok: false as const, error: 'You can’t delete your own account.' }
    const user = await prisma.user.findUnique({ where: { id: data.id }, select: { role: true } })
    if (user?.role === 'ADMIN' && (await prisma.user.count({ where: { role: 'ADMIN' } })) <= 1) {
      return { ok: false as const, error: lastAdmin }
    }
    // Orders, reviews and questions are kept; their link to the account is cleared by the database
    await prisma.user.deleteMany({ where: { id: data.id } })
    return { ok: true as const }
  })
