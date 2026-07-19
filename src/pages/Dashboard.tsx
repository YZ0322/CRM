import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { request } from '../lib/request';

interface StatsData {
  totalCustomers: number;
  totalOrders: number;
  totalAmount: number;
  totalProducts: number;
  activeCustomers: number;
  pendingOrders: number;
  approvedOrders: number;
  shippedOrders: number;
  completedOrders: number;
  refundPendingOrders: number;
}

interface RecentOrder {
  id: number;
  order_no: string;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customerStats, orderStats, productStats, recent] = await Promise.all([
          request.get('/customers/stats'),
          request.get('/orders/stats'),
          request.get('/products/stats'),
          request.get('/orders/recent', { params: { limit: 5 } }),
        ]);

        setStats({
          totalCustomers: customerStats.totalCustomers,
          activeCustomers: customerStats.activeCount,
          totalOrders: orderStats.totalOrders,
          totalAmount: orderStats.totalAmount,
          totalProducts: productStats.totalProducts,
          pendingOrders: orderStats.pendingCount,
          approvedOrders: orderStats.approvedCount,
          shippedOrders: orderStats.shippedCount,
          completedOrders: orderStats.completedCount,
          refundPendingOrders: orderStats.refundPendingCount,
        });

        setRecentOrders(recent);
      } catch (err) {
        console.error('获取仪表盘数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'paid': return '已支付';
      case 'shipped': return '已发货';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      case 'refund_pending': return '退款中';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'refund_pending': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const statusDistribution = stats ? [
    { status: '待审核', count: stats.pendingOrders, percentage: stats.totalOrders > 0 ? Math.round((stats.pendingOrders / stats.totalOrders) * 100) : 0, color: 'bg-yellow-500' },
    { status: '未发货', count: stats.approvedOrders, percentage: stats.totalOrders > 0 ? Math.round((stats.approvedOrders / stats.totalOrders) * 100) : 0, color: 'bg-orange-500' },
    { status: '已发货', count: stats.shippedOrders, percentage: stats.totalOrders > 0 ? Math.round((stats.shippedOrders / stats.totalOrders) * 100) : 0, color: 'bg-blue-500' },
    { status: '已完成', count: stats.completedOrders, percentage: stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0, color: 'bg-emerald-500' },
    { status: '退款中', count: stats.refundPendingOrders, percentage: stats.totalOrders > 0 ? Math.round((stats.refundPendingOrders / stats.totalOrders) * 100) : 0, color: 'bg-red-500' },
  ] : [];

  return (
    <Layout title="仪表盘">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                  <div className="w-12 h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-24 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-32"></div>
              </div>
            ))
          ) : stats ? (
            [
              {
                title: '客户总数',
                value: stats.totalCustomers.toLocaleString(),
                change: stats.activeCustomers > 0 ? `+${Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}%` : '+0%',
                trend: 'up' as const,
                icon: Users,
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-500/10',
              },
              {
                title: '本月订单',
                value: stats.totalOrders.toLocaleString(),
                change: stats.pendingOrders > 0 ? `+${stats.pendingOrders}待审核` : '+0%',
                trend: 'up' as const,
                icon: ShoppingCart,
                color: 'from-indigo-500 to-purple-500',
                bgColor: 'bg-indigo-500/10',
              },
              {
                title: '销售额',
                value: `¥${stats.totalAmount.toLocaleString()}`,
                change: '+0%',
                trend: 'up' as const,
                icon: DollarSign,
                color: 'from-emerald-500 to-teal-500',
                bgColor: 'bg-emerald-500/10',
              },
              {
                title: '商品总量',
                value: stats.totalProducts.toLocaleString(),
                change: '-3.2%',
                trend: 'down' as const,
                icon: Package,
                color: 'from-orange-500 to-amber-500',
                bgColor: 'bg-orange-500/10',
              },
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {card.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {card.change}
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                </div>
              );
            })
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">销售趋势</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg">本周</button>
                <button className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">本月</button>
                <button className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">本季度</button>
              </div>
            </div>
            <div className="h-64 flex items-end gap-4">
              {[65, 80, 55, 90, 70, 85, 75].map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 cursor-pointer"
                  style={{ height: `${value}%` }}
                  title={`第${index + 1}天: ${value}%`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-400">
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                <span key={index} className="flex-1 text-center">{day}</span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">订单状态分布</h2>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                      <div className="h-4 bg-slate-200 rounded w-8"></div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-200 rounded-full" style={{ width: `${Math.random() * 100}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                statusDistribution.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.status}</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">最近订单</h2>
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">查看全部</button>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                      <div className="h-3 bg-slate-200 rounded w-16 mt-1"></div>
                    </div>
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p>暂无订单数据</p>
                </div>
              ) : (
                recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-medium">
                        {order.customer_name?.charAt(0) || order.customer_id.toString()[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{order.customer_name || `客户ID: ${order.customer_id}`}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{order.order_no}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-800 dark:text-slate-100">¥{Number(order.total_amount).toFixed(2)}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">快捷操作</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: '新建客户', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', path: '/customers' },
                { name: '创建订单', icon: ShoppingCart, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600', path: '/create-order' },
                { name: '订单审核', icon: Package, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600', path: '/order-approval' },
                { name: '商品管理', icon: Package, color: 'bg-green-100 dark:bg-green-900/30 text-green-600', path: '/products' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => window.location.href = item.path}
                    className={`flex items-center gap-3 p-4 rounded-xl ${item.color} hover:opacity-90 transition-opacity text-left`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}