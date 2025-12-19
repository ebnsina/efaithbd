import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all mid banners
export async function GET() {
  try {
    const banners = await prisma.midBanner.findMany({
      orderBy: { position: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching mid banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mid banners' },
      { status: 500 }
    )
  }
}

// POST create new mid banner
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, subtitle, image, link, position, active } = body

    const banner = await prisma.midBanner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        position: position || 1,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating mid banner:', error)
    return NextResponse.json(
      { error: 'Failed to create mid banner' },
      { status: 500 }
    )
  }
}
