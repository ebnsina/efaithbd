import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { prisma } from '@/server/db.server'

// Content tables that share order/active/delete handling
export const contentTables = [
  'banner',
  'productSection',
  'featureCard',
  'midBanner',
  'faq',
  'highlight',
  'page',
  'menuItem',
  'footerSection',
  'footerLink',
  'socialLink',
] as const
export type ContentTable = (typeof contentTables)[number]

type Row = {
  update(args: { where: { id: string }; data: { order?: number; active?: boolean } }): Prisma.PrismaPromise<unknown>
  delete(args: { where: { id: string } }): Prisma.PrismaPromise<unknown>
}
// Prisma delegates have no common callable type; every listed table has id, and order/active where they are used
const table = (name: ContentTable) => prisma[name] as unknown as Row

const tableSchema = v.picklist(contentTables)

export const reorderRows = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(
    v.object({
      table: tableSchema,
      ids: v.pipe(v.array(v.string()), v.maxLength(500)),
    })
  )
  .handler(async ({ data }) => {
    await prisma.$transaction(data.ids.map((id, order) => table(data.table).update({ where: { id }, data: { order } })))
    return { ok: true }
  })

export const setRowActive = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ table: tableSchema, id: v.string(), active: v.boolean() }))
  .handler(async ({ data }) => {
    await table(data.table).update({
      where: { id: data.id },
      data: { active: data.active },
    })
    return { ok: true }
  })

export const deleteRow = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ table: tableSchema, id: v.string() }))
  .handler(async ({ data }) => {
    await table(data.table).delete({ where: { id: data.id } })
    return { ok: true }
  })
