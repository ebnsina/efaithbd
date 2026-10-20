import { createHmac, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { prisma } from './db.server'

const COOKIE = 'session'
const MAX_AGE = 60 * 60 * 24 * 30
const secret = process.env.SESSION_SECRET
if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters')

const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url')

export function startSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  setCookie(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export const endSession = () => deleteCookie(COOKIE, { path: '/' })

function readUserId(): string | null {
  const [payload, signature] = getCookie(COOKIE)?.split('.') ?? []
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { uid: string; exp: number }
  return exp > Date.now() ? uid : null
}

// Role is read from the database on every request, so a demoted or deleted user loses access immediately
export async function getSessionUser() {
  const id = readUserId()
  if (!id) return null
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, role: true } })
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>
