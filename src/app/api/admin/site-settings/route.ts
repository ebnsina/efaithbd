import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.basicSettings.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.basicSettings.create({
        data: {
          siteName: 'SuperMart',
          promoActive: false,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { logo, siteName, promoText, promoActive } = body

    // Get or create settings
    let settings = await prisma.basicSettings.findFirst()

    if (!settings) {
      settings = await prisma.basicSettings.create({
        data: {
          logo,
          siteName,
          promoText,
          promoActive,
        },
      })
    } else {
      settings = await prisma.basicSettings.update({
        where: { id: settings.id },
        data: {
          logo,
          siteName,
          promoText,
          promoActive,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    )
  }
}
