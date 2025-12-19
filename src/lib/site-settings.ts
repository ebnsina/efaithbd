import { prisma } from './prisma'

/**
 * Get basic site settings from database
 * Use this in server components and API routes
 */
export async function getSiteSettings() {
  try {
    const settings = await prisma.basicSettings.findFirst()
    return settings
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}

/**
 * Get site name with fallback
 */
export async function getSiteName(): Promise<string> {
  const settings = await getSiteSettings()
  return settings?.siteName || 'Online Store'
}

