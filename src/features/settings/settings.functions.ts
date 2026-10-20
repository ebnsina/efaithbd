import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'

export const getSiteSettings = createServerFn().handler(() => prisma.basicSettings.findFirst())
