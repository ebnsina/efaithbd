import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [socialLinks, contactInfo, footerSections, footerSettings, basicSettings] = await Promise.all([
      prisma.socialLink.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.contactInfo.findFirst(),
      prisma.footerSection.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
        include: {
          links: {
            where: { active: true },
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.footerSettings.findFirst(),
      prisma.basicSettings.findFirst(),
    ])

    return NextResponse.json({
      socialLinks,
      contactInfo,
      footerSections,
      footerSettings,
      siteName: basicSettings?.siteName || 'Company Name',
    })
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    )
  }
}
