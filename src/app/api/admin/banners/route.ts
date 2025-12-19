import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

// POST create new banner
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, subtitle, image, link, order, active } = body

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
