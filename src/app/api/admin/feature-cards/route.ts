import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all feature cards
export async function GET() {
  try {
    const cards = await prisma.featureCard.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching feature cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature cards' },
      { status: 500 }
    )
  }
}

// POST create new feature card
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, icon, order, active } = body

    const card = await prisma.featureCard.create({
      data: {
        title,
        description,
        icon,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error creating feature card:', error)
    return NextResponse.json(
      { error: 'Failed to create feature card' },
      { status: 500 }
    )
  }
}
