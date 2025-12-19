import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all social links
export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching social links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social links' },
      { status: 500 }
    )
  }
}

// POST create new social link
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, url, icon, order, active } = body

    const link = await prisma.socialLink.create({
      data: {
        platform,
        url,
        icon,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Error creating social link:', error)
    return NextResponse.json(
      { error: 'Failed to create social link' },
      { status: 500 }
    )
  }
}
