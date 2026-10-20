import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/server/db.server'
import { getSessionUser } from '@/server/session.server'
import { answerQuestionSchema, askQuestionSchema, QUESTIONS_PAGE_SIZE, questionListSchema } from './schemas'

export const listQuestions = createServerFn()
  .validator(questionListSchema)
  .handler(async ({ data: { productId, page } }) => {
    const where = { productId, approved: true }
    const [rows, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * QUESTIONS_PAGE_SIZE,
        take: QUESTIONS_PAGE_SIZE,
        select: {
          id: true,
          question: true,
          createdAt: true,
          user: { select: { name: true } },
          answers: {
            where: { approved: true },
            orderBy: [{ isOfficial: 'desc' }, { createdAt: 'asc' }],
            select: { id: true, answer: true, isOfficial: true, createdAt: true, user: { select: { name: true } } },
          },
        },
      }),
      prisma.question.count({ where }),
    ])
    return { rows, total, hasMore: page * QUESTIONS_PAGE_SIZE < total }
  })

export const askQuestion = createServerFn({ method: 'POST' })
  .validator(askQuestionSchema)
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) return { ok: false as const, error: 'Please sign in to ask a question' }
    const product = await prisma.product.findUnique({ where: { id: data.productId, active: true }, select: { id: true } })
    if (!product) return { ok: false as const, error: 'This product is no longer available' }
    await prisma.question.create({
      data: { productId: data.productId, userId: user.id, question: data.question, approved: false },
    })
    return { ok: true as const }
  })

export const answerQuestion = createServerFn({ method: 'POST' })
  .validator(answerQuestionSchema)
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) return { ok: false as const, error: 'Please sign in to answer' }
    const question = await prisma.question.findUnique({
      where: { id: data.questionId, approved: true },
      select: { id: true },
    })
    if (!question) return { ok: false as const, error: 'This question is no longer available' }
    // Store staff answers are marked official and shown right away; customer answers wait for approval
    const isOfficial = user.role === 'ADMIN'
    await prisma.answer.create({
      data: { questionId: question.id, userId: user.id, answer: data.answer, isOfficial, approved: isOfficial },
    })
    return { ok: true as const, published: isOfficial }
  })
