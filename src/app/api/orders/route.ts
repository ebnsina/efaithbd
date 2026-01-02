import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      bkashNumber,
      bkashTrxId,
      items,
      subtotal,
      discount,
      shippingCost,
      total,
      couponCode,
      shippingMethodId,
    } = body

    // Validate required fields
    if (
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json({ error: 'সব তথ্য পূরণ করুন' }, { status: 400 })
    }

    // Find coupon if provided
    let couponId = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })
      if (coupon) {
        couponId = coupon.id
        // Increment usage count
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        })
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`

    // Prepare order data (only include userId if session exists and user is verified)
    const orderData: any = {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      bkashNumber: bkashNumber || null,
      bkashTrxId: bkashTrxId || null,
      subtotal,
      discount: discount || 0,
      shippingCost: shippingCost || 0,
      total,
      couponId,
      shippingMethodId: shippingMethodId || null,
    }

    // Only add userId if session exists and user exists in database
    if (session?.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
      if (userExists) {
        orderData.userId = session.user.id
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        coupon: true,
        shippingMethod: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'অর্ডার সম্পন্ন হয়নি' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')

    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
          shippingMethod: true,
        },
      })

      if (!order) {
        return NextResponse.json(
          { error: 'অর্ডার পাওয়া যায়নি' },
          { status: 404 }
        )
      }

      return NextResponse.json(order)
    }

    // Get all orders (admin)
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        coupon: true,
        shippingMethod: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'সমস্যা হয়েছে' }, { status: 500 })
  }
}
