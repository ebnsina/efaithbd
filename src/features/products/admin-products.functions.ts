import { createServerFn } from '@tanstack/react-start'
import * as v from 'valibot'
import { adminMiddleware } from '@/features/auth/auth.functions'
import type { Prisma } from '@/generated/client/client'
import { toPrismaPage } from '@/lib/list-search'
import { prisma } from '@/server/db.server'
import {
  adminProductSearchSchema,
  type ProductFormValues,
  productFormSchema,
  type SaveResult,
  updateProductSchema,
} from './schemas'

export const listAdminProducts = createServerFn()
  .middleware([adminMiddleware])
  .validator(adminProductSearchSchema)
  .handler(async ({ data: search }) => {
    const { q, status } = search
    const where: Prisma.ProductWhereInput = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ],
      }),
      ...(status === 'active' && { active: true }),
      ...(status === 'inactive' && { active: false }),
      ...(status === 'featured' && { featured: true }),
    }
    const [rows, rowCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
          featured: true,
          active: true,
          category: { select: { name: true } },
          _count: { select: { variants: true } },
        },
        ...toPrismaPage(search, ['name', 'price', 'stock', 'createdAt'], 'createdAt'),
      }),
      prisma.product.count({ where }),
    ])
    return { rows, rowCount }
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(async ({ data }) => {
    // Order items keep a hard reference to the product, so ordered products can only be switched off
    const orders = await prisma.orderItem.count({ where: { productId: data.id } })
    if (orders > 0) {
      return {
        ok: false as const,
        error: 'This product is part of past orders, so it can’t be deleted. Mark it inactive to hide it instead.',
      }
    }
    await prisma.product.deleteMany({ where: { id: data.id } })
    return { ok: true as const }
  })

const productDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  comparePrice: true,
  stock: true,
  images: true,
  categoryId: true,
  subcategoryId: true,
  featured: true,
  active: true,
  variants: {
    select: { id: true, name: true, value: true, price: true, stock: true, sku: true },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.ProductSelect

export type AdminProductDetail = Prisma.ProductGetPayload<{ select: typeof productDetailSelect }>

export const getAdminProduct = createServerFn()
  .middleware([adminMiddleware])
  .validator(v.object({ id: v.string() }))
  .handler(({ data }) => prisma.product.findUnique({ where: { id: data.id }, select: productDetailSelect }))

async function checkProduct(values: ProductFormValues, id?: string): Promise<Record<string, string>> {
  const errors: Record<string, string> = {}
  const skus = values.variants.map((variant) => variant.sku.trim()).filter(Boolean)
  const [slugTaken, category, takenSkus] = await Promise.all([
    prisma.product.findFirst({ where: { slug: values.slug.trim(), ...(id && { NOT: { id } }) }, select: { id: true } }),
    prisma.category.findUnique({
      where: { id: values.categoryId },
      select: { subcategories: { select: { id: true } } },
    }),
    prisma.productVariant.findMany({
      where: { sku: { in: skus }, ...(id && { NOT: { productId: id } }) },
      select: { sku: true },
    }),
  ])
  if (slugTaken) errors.slug = 'Another product already uses this web address'
  if (!category) errors.categoryId = 'This category no longer exists. Choose another one.'
  else if (values.subcategoryId && !category.subcategories.some((sub) => sub.id === values.subcategoryId)) {
    errors.subcategoryId = 'Choose a subcategory from the selected category'
  }
  const seen = new Set<string>()
  values.variants.forEach((variant, index) => {
    const sku = variant.sku.trim()
    if (!sku) return
    if (seen.has(sku) || takenSkus.some((taken) => taken.sku === sku)) {
      errors[`variants[${index}].sku`] = 'This SKU is already in use'
    }
    seen.add(sku)
  })
  return errors
}

function productData(values: v.InferOutput<typeof productFormSchema>) {
  const { variants, subcategoryId, ...product } = values
  return {
    ...product,
    subcategoryId: subcategoryId || null,
    // A product with variants is in stock as long as any variant is
    stock: variants.length > 0 ? variants.reduce((sum, variant) => sum + variant.stock, 0) : product.stock,
  }
}

const variantData = ({ id: _id, sku, ...variant }: v.InferOutput<typeof productFormSchema>['variants'][number]) => ({
  ...variant,
  sku: sku || null,
})

const isUniqueError = (error: unknown) => (error as { code?: string })?.code === 'P2002'
const fieldProblem = (fieldErrors: Record<string, string>): SaveResult => ({
  ok: false,
  error: 'Please fix the highlighted fields',
  fieldErrors,
})
const duplicateProblem: SaveResult = {
  ok: false,
  error: 'The web address or a SKU is already in use. Change it and try again.',
}

export const createProduct = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(productFormSchema)
  .handler(async ({ data }): Promise<SaveResult> => {
    const fieldErrors = await checkProduct(data)
    if (Object.keys(fieldErrors).length) return fieldProblem(fieldErrors)
    try {
      const product = await prisma.product.create({
        data: { ...productData(data), variants: { create: data.variants.map(variantData) } },
        select: { id: true },
      })
      return { ok: true, id: product.id }
    } catch (error) {
      if (isUniqueError(error)) return duplicateProblem
      throw error
    }
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator(updateProductSchema)
  .handler(async ({ data: { id, values } }): Promise<SaveResult> => {
    if (!(await prisma.product.findUnique({ where: { id }, select: { id: true } }))) {
      return { ok: false, error: 'This product no longer exists. It may have been deleted.' }
    }
    const fieldErrors = await checkProduct(values, id)
    if (Object.keys(fieldErrors).length) return fieldProblem(fieldErrors)
    const kept = values.variants.filter((variant) => variant.id).map((variant) => variant.id)
    try {
      // Variants are updated in place, not recreated, so past orders keep pointing at the variant they bought
      await prisma.$transaction([
        prisma.productVariant.deleteMany({ where: { productId: id, id: { notIn: kept } } }),
        ...values.variants
          .filter((variant) => variant.id)
          .map((variant) =>
            prisma.productVariant.update({ where: { id: variant.id, productId: id }, data: variantData(variant) }),
          ),
        prisma.product.update({
          where: { id },
          data: {
            ...productData(values),
            variants: { create: values.variants.filter((variant) => !variant.id).map(variantData) },
          },
        }),
      ])
      return { ok: true, id }
    } catch (error) {
      if (isUniqueError(error)) return duplicateProblem
      throw error
    }
  })
