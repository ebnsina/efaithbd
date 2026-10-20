import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'

const MAX_BYTES = 5 * 1024 * 1024

export const uploadImageFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .validator((data: unknown) => {
    const file = data instanceof FormData ? data.get('file') : null
    if (!(file instanceof File)) throw new Error('Choose an image to upload')
    if (!file.type.startsWith('image/')) throw new Error('Only image files can be uploaded')
    if (file.size > MAX_BYTES) throw new Error('Images must be 5 MB or smaller')
    return file
  })
  .handler(async ({ data: file }) => {
    const { uploadImage } = await import('@/server/cloudinary.server')
    const { prisma } = await import('@/server/db.server')
    const settings = await prisma.basicSettings.findFirst({ select: { siteName: true } })
    const folder = (settings?.siteName ?? 'store').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return { url: await uploadImage(file, `${folder}/products`) }
  })
