import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'

export const listFaqs = createServerFn().handler(() =>
  prisma.faq.findMany({
    where: { active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, question: true, answer: true },
  })
)
