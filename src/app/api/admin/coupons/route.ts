import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/admin/coupons - Get all coupons (admin only)
export async function GET() {
  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/admin/coupons - Create a new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const {
      code,
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      validFrom,
      validTo,
      usageLimit,
      active,
    } = body

    if (!code || !type || !value || !validFrom || !validTo) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // Check if coupon code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value,
        minPurchase,
        maxDiscount,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        usageLimit,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
