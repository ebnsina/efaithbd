import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { SaveResult } from '@/features/products/schemas'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import { type CategoryFormValues, categoryFormSchema, categorySearchSchema, updateCategorySchema } from './schemas'

export const listAdminCategories = createServerFn()
  .middleware([adminMiddleware])
  .validator(categorySearchSchema)
  .handler(async ({ data: search }) => {
    const { q } = search
    const where: Prisma.CategoryWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { subcategories: { some: { name: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {}
    const [rows, rowCount] = await Promise.all([
      prisma.category.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          createdAt: true,
          subcategories: { select: { name: true }, orderBy: { name: 'asc' } },
          _count: { select: { products: true } },
        },
        ...toPrismaPage(search, ['name', 'createdAt'], 'createdAt'),
      }),
      prisma.category.count({ where }),
    ])
    return { rows, rowCount }
  })

export const listCategoryOptions = createServerFn()
  .middleware([adminMiddleware])
  .handler(() =>
    prisma.category.findMany({
      select: { id: true, name: true, subcategories: { select: { id: true, name: true }, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
  )

export const getAdminCategory = createServerFn()
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(({ data }) =>
    prisma.category.findUnique({
      where: { id: data.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        subcategories: { select: { id: true, name: true, slug: true }, orderBy: { createdAt: 'asc' } },
      },
    }),
  )

async function checkCategory(values: CategoryFormValues, id?: string) {
  const errors: Record<string, string> = {}
  const subSlugs = values.subcategories.map((sub) => sub.slug.trim())
  const keptIds = values.subcategories.filter((sub) => sub.id).map((sub) => sub.id)
  const [slugTaken, takenSubSlugs] = await Promise.all([
    prisma.category.findFirst({
      where: { slug: values.slug.trim(), ...(id && { NOT: { id } }) },
      select: { id: true },
    }),
    prisma.subCategory.findMany({ where: { slug: { in: subSlugs }, id: { notIn: keptIds } }, select: { slug: true } }),
  ])
  if (slugTaken) errors.slug = 'Another category already uses this web address'
  const seen = new Set<string>()
  subSlugs.forEach((slug, index) => {
    if (seen.has(slug) || takenSubSlugs.some((taken) => taken.slug === slug)) {
      errors[`subcategories[${index}].slug`] = 'Another subcategory already uses this web address'
    }
    seen.add(slug)
  })
  return errors
}

const categoryData = ({ subcategories: _, description, image, ...category }: CategoryFormValues) => ({
  ...category,
  description: description || null,
  image: image || null,
})

const isUniqueError = (error: unknown) => (error as { code?: string })?.code === 'P2002'
const fieldProblem = (fieldErrors: Record<string, string>): SaveResult => ({
  ok: false,
  error: 'Please fix the highlighted fields',
  fieldErrors,
})
const duplicateProblem: SaveResult = { ok: false, error: 'A web address is already in use. Change it and try again.' }

export const createCategory = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(categoryFormSchema)
  .handler(async ({ data }): Promise<SaveResult> => {
    const fieldErrors = await checkCategory(data)
    if (Object.keys(fieldErrors).length) return fieldProblem(fieldErrors)
    try {
      const category = await prisma.category.create({
        data: {
          ...categoryData(data),
          subcategories: { create: data.subcategories.map(({ name, slug }) => ({ name, slug })) },
        },
        select: { id: true },
      })
      return { ok: true, id: category.id }
    } catch (error) {
      if (isUniqueError(error)) return duplicateProblem
      throw error
    }
  })

export const updateCategory = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateCategorySchema)
  .handler(async ({ data: { id, values } }): Promise<SaveResult> => {
    if (!(await prisma.category.findUnique({ where: { id }, select: { id: true } }))) {
      return { ok: false, error: 'This category no longer exists. It may have been deleted.' }
    }
    const fieldErrors = await checkCategory(values, id)
    if (Object.keys(fieldErrors).length) return fieldProblem(fieldErrors)
    const kept = values.subcategories.filter((sub) => sub.id)
    try {
      // Products in a removed subcategory stay in the category; the relation clears their subcategory
      await prisma.$transaction([
        prisma.subCategory.deleteMany({ where: { categoryId: id, id: { notIn: kept.map((sub) => sub.id) } } }),
        ...kept.map((sub) =>
          prisma.subCategory.update({ where: { id: sub.id, categoryId: id }, data: { name: sub.name, slug: sub.slug } }),
        ),
        prisma.category.update({
          where: { id },
          data: {
            ...categoryData(values),
            subcategories: {
              create: values.subcategories.filter((sub) => !sub.id).map(({ name, slug }) => ({ name, slug })),
            },
          },
        }),
      ])
      return { ok: true, id }
    } catch (error) {
      if (isUniqueError(error)) return duplicateProblem
      throw error
    }
  })

export const deleteCategory = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(async ({ data }) => {
    // Products cascade-delete with their category, so a category in use must be emptied first
    const products = await prisma.product.count({ where: { categoryId: data.id } })
    if (products > 0) {
      return {
        ok: false as const,
        error: `This category still has ${products} product${products === 1 ? '' : 's'}. Move them to another category or delete them first.`,
      }
    }
    await prisma.category.deleteMany({ where: { id: data.id } })
    return { ok: true as const }
  })
