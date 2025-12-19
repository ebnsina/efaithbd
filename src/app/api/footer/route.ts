import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [socialLinks, contactInfo] = await Promise.all([
      prisma.socialLink.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.contactInfo.findFirst(),
    ])

    return NextResponse.json({
      socialLinks,
      contactInfo,
    })
  } catch (error) {
    console.error('Error fetching footer data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    )
  }
}
