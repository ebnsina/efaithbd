import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all footer sections with links
export async function GET() {
  try {
    const sections = await prisma.footerSection.findMany({
      include: {
        links: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching footer sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer sections' },
      { status: 500 }
    )
  }
}

// POST create new footer section
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, order, active } = body

    const section = await prisma.footerSection.create({
      data: {
        title,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating footer section:', error)
    return NextResponse.json(
      { error: 'Failed to create footer section' },
      { status: 500 }
    )
  }
}
