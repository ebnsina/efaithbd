import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import type { OrderStatus } from '@/generated/client/enums';
import { Clock, Package, ShoppingBag, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const [totalProducts, totalOrders, pendingOrders, revenue, todayOrders, activeProducts, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.product.count({ where: { active: true } }),
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
    ]);
  const data = {
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: revenue._sum.total || 0,
    todayOrders,
    activeProducts,
  };

  const stats = [
    {
      title: 'Total Products',
      value: data.totalProducts.toLocaleString('en-US'),
      subtitle: `${data.activeProducts} active`,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString('en-US'),
      subtitle: `${data.todayOrders} today`,
      icon: ShoppingBag,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Pending Orders',
      value: data.pendingOrders.toLocaleString('en-US'),
      subtitle: 'Waiting',
      icon: Clock,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Total Revenue',
      value: `৳${data.totalRevenue.toLocaleString('en-US')}`,
      subtitle: 'Paid orders',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          label: 'Pending',
        };
      case 'CONFIRMED':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          label: 'Confirmed',
        };
      case 'PROCESSING':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          label: 'Processing',
        };
      case 'SHIPPED':
        return {
          bg: 'bg-cyan-50',
          text: 'text-cyan-700',
          border: 'border-cyan-200',
          label: 'Shipped',
        };
      case 'DELIVERED':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          label: 'Delivered',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          label: status,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{'Dashboard'}</h1>
        <p className="text-muted-foreground mt-2">{'Store Overview'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{'Recent Orders'}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{'Last 10 orders'}</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-primary hover:text-primary/90"
            >
              {'View All'} →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {'Order Number'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {'Customer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {'Items'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {'Total'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {'Date'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-gray-500">{order.customerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{order._count.items} items</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ৳{order.total.toLocaleString('en-US')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
