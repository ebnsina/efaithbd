import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('Phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'ফোন নম্বর প্রদান করুন' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json({ error: 'সঠিক ফোন নম্বর দিন' }, { status: 400 })
    }

    // Find all orders for this phone number
    const orders = await prisma.order.findMany({
      where: {
        customerPhone: phone,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        total: true,
        orderStatus: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'অর্ডার খুঁজতে সমস্যা হয়েছে' },
      { status: 500 }
    )
  }
}
