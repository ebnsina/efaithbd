import { cache } from 'react'
import { prisma } from './prisma'

/**
 * Get basic site settings from database
 * Use this in server components and API routes
 */
// cache() dedupes the many metadata/layout callers into one query per request
export const getSiteSettings = cache(async () => {
  try {
    return await prisma.basicSettings.findFirst()
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
})

/**
 * Get site name with fallback
 */
export async function getSiteName(): Promise<string> {
  const settings = await getSiteSettings()
  return settings?.siteName || 'Online Store'
}

