import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/admin/coupons/[id] - Get a specific coupon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/coupons/[id] - Update a coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // If updating code, check for duplicates
    if (code) {
      const existing = await prisma.coupon.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        )
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value !== undefined && { value }),
        ...(minPurchase !== undefined && { minPurchase }),
        ...(maxDiscount !== undefined && { maxDiscount }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validTo && { validTo: new Date(validTo) }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/coupons/[id] - Delete a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
