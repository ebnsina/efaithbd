import { createServerFn } from '@tanstack/react-start'
import { adminMiddleware } from '@/features/auth/auth.functions'
import { prisma } from '@/server/db.server'

// Midnight in the store's time zone, not the server's
function startOfToday(timeZone: string) {
  const now = new Date()
  const wallClock = new Date(now.toLocaleString('en-US', { timeZone }))
  return new Date(now.getTime() - (wallClock.getTime() - new Date(wallClock).setHours(0, 0, 0, 0)))
}

export const getDashboard = createServerFn()
  .middleware([adminMiddleware])
  .handler(async () => {
    const [totalProducts, activeProducts, totalOrders, pendingOrders, revenue, todayOrders, recentOrders] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.order.count(),
        prisma.order.count({ where: { orderStatus: 'PENDING' } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'PAID' },
        }),
        prisma.basicSettings.findFirst({ select: { timezone: true } }).then((settings) =>
          prisma.order.count({
            where: {
              createdAt: {
                gte: startOfToday(settings?.timezone ?? 'Asia/Dhaka'),
              },
            },
          }),
        ),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
            total: true,
            orderStatus: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
        }),
      ])
    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      revenue: revenue._sum.total ?? 0,
      todayOrders,
      recentOrders,
    }
  })
