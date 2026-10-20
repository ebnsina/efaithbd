import { createMiddleware, createServerFn } from '@tanstack/react-start'
import bcrypt from 'bcryptjs'
import { prisma } from '@/server/db.server'
import { endSession, getSessionUser, startSession } from '@/server/session.server'
import { loginSchema, registerSchema } from './schemas'

export const getCurrentUser = createServerFn().handler(() => getSessionUser())

export const login = createServerFn({ method: 'POST' })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    // Same message for unknown email and wrong password, so the form can't be used to probe accounts
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return { ok: false as const, error: 'Email or password is incorrect' }
    }
    startSession(user.id)
    return { ok: true as const, role: user.role }
  })

export const register = createServerFn({ method: 'POST' })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    if (await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })) {
      return { ok: false as const, error: 'An account with this email already exists' }
    }
    const user = await prisma.user.create({
      data: { ...data, password: await bcrypt.hash(data.password, 10), role: 'CUSTOMER' },
    })
    startSession(user.id)
    return { ok: true as const }
  })

export const logout = createServerFn({ method: 'POST' }).handler(() => {
  endSession()
  return { ok: true }
})

// Every admin server function runs behind this; it throws before the handler for anyone else
export const adminMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getSessionUser()
  if (user?.role !== 'ADMIN') throw new Error('UNAUTHORIZED')
  return next({ context: { user } })
})
