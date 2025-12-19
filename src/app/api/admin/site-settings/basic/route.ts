import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.basicSettings.findFirst()

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
    console.error('Error fetching basic settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch basic settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    let settings = await prisma.basicSettings.findFirst()

    if (!settings) {
      settings = await prisma.basicSettings.create({
        data: body,
      })
    } else {
      settings = await prisma.basicSettings.update({
        where: { id: settings.id },
        data: body,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating basic settings:', error)
    return NextResponse.json(
      { error: 'Failed to update basic settings' },
      { status: 500 }
    )
  }
}
