import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/coupons/validate - Validate and apply a coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Coupon code and subtotal are required' },
        { status: 400 }
      )
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      )
    }

    // Check validity dates
    const now = new Date()
    if (now < coupon.validFrom) {
      return NextResponse.json(
        { error: 'This coupon is not yet valid' },
        { status: 400 }
      )
    }

    if (now > coupon.validTo) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit' },
        { status: 400 }
      )
    }

    // Check minimum purchase
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase of ${coupon.minPurchase} required to use this coupon`,
        },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * coupon.value) / 100
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      // FIXED
      discount = coupon.value
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal)

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      discount,
      total: subtotal - discount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
      },
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
