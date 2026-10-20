import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { createAnswerSchema, questionSearchSchema, updateAnswerSchema } from './schemas'

const idSchema = v.object({ id: v.string() })
const approvalSchema = v.object({ id: v.string(), approved: v.boolean() })

const questionSelect = {
  id: true,
  question: true,
  approved: true,
  createdAt: true,
  product: { select: { name: true, slug: true } },
  user: { select: { name: true } },
  answers: {
    select: {
      id: true,
      answer: true,
      isOfficial: true,
      approved: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.QuestionSelect

export const listAdminQuestions = createServerFn()
  .middleware([adminMiddleware])
  .validator(questionSearchSchema)
  .handler(async ({ data: search }) => {
    const { q, status, answered } = search
    const where: Prisma.QuestionWhereInput = {
      ...(q && {
        OR: [
          { question: { contains: q, mode: 'insensitive' } },
          { product: { name: { contains: q, mode: 'insensitive' } } },
          { user: { name: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(status && { approved: status === 'published' }),
      ...(answered && { answers: answered === 'answered' ? { some: {} } : { none: {} } }),
    }
    const [rows, rowCount, pendingCount] = await Promise.all([
      prisma.question.findMany({
        where,
        select: questionSelect,
        ...toPrismaPage(search, ['createdAt'], 'createdAt'),
      }),
      prisma.question.count({ where }),
      prisma.question.count({ where: { approved: false } }),
    ])
    return { rows, rowCount, pendingCount }
  })

export const getAdminQuestion = createServerFn()
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(({ data }) => prisma.question.findUnique({ where: { id: data.id }, select: questionSelect }))

export const setQuestionApproval = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(approvalSchema)
  .handler(async ({ data }) => {
    await prisma.question.update({ where: { id: data.id }, data: { approved: data.approved }, select: { id: true } })
    return { ok: true }
  })

export const deleteQuestion = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => {
    await prisma.question.deleteMany({ where: { id: data.id } })
    return { ok: true }
  })

// A store answer is official and shown right away; answering also publishes the question, or the answer stays hidden
export const createAnswer = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(createAnswerSchema)
  .handler(async ({ data, context }) => {
    await prisma.question.update({
      where: { id: data.questionId },
      data: {
        approved: true,
        answers: {
          create: { answer: data.values.answer, userId: context.user.id, isOfficial: true, approved: true },
        },
      },
      select: { id: true },
    })
    return { ok: true }
  })

export const updateAnswer = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateAnswerSchema)
  .handler(async ({ data }) => {
    await prisma.answer.update({ where: { id: data.id }, data: { answer: data.values.answer }, select: { id: true } })
    return { ok: true }
  })

export const setAnswerApproval = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(approvalSchema)
  .handler(async ({ data }) => {
    await prisma.answer.update({ where: { id: data.id }, data: { approved: data.approved }, select: { id: true } })
    return { ok: true }
  })

export const deleteAnswer = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(idSchema)
  .handler(async ({ data }) => {
    await prisma.answer.deleteMany({ where: { id: data.id } })
    return { ok: true }
  })
