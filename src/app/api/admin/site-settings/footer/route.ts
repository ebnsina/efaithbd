import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.footerSettings.findFirst()

    if (!settings) {
      settings = await prisma.footerSettings.create({
        data: {
          showPaymentMethods: true,
          enableNewsletter: true,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    let settings = await prisma.footerSettings.findFirst()

    if (!settings) {
      settings = await prisma.footerSettings.create({
        data: body,
      })
    } else {
      settings = await prisma.footerSettings.update({
        where: { id: settings.id },
        data: body,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating footer settings:', error)
    return NextResponse.json(
      { error: 'Failed to update footer settings' },
      { status: 500 }
    )
  }
}
