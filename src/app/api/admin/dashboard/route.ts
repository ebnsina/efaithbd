import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      todayOrders,
      activeProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.product.count({ where: { active: true } }),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      todayOrders,
      activeProducts,
      recentOrders,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
