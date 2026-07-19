import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Check, X, Clock, User, Package, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { orderApi } from '../api/order';

interface OrderItem {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: number;
  order_no: string;
  customer_name: string;
  customer_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  remark?: string;
  shipping_address?: { name: string; phone: string; address: string };
  items?: OrderItem[];
}

export function OrderApproval() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const canApprove = user?.role === 'super_admin' || user?.role === 'admin';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await orderApi.getList({ status: 'pending' });
      setOrders(result.data);
    } catch (err) {
      console.error('获取待审核订单失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId: number) => {
    try {
      await orderApi.approve(orderId, user?.id || 1);
      fetchOrders();
    } catch (err) {
      console.error('审核订单失败:', err);
    }
  };

  const handleReject = async (orderId: number) => {
    try {
      await orderApi.reject(orderId);
      fetchOrders();
    } catch (err) {
      console.error('拒绝订单失败:', err);
    }
  };

  if (!canApprove) {
    return (
      <Layout title="订单审核">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">权限不足</h2>
            <p className="text-slate-500 max-w-md">
              订单审核功能仅对管理员和超级管理员开放，请联系管理员获取相应权限。
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="订单审核">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                管理员/超管可见
              </div>
              <span className="text-slate-500">待审核订单</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                      <div>
                        <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="h-5 bg-slate-200 rounded w-24"></div>
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-16 h-9 bg-slate-200 rounded"></div>
                        <div className="w-16 h-9 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无待审核订单</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 rounded-xl border transition-all ${
                    order.status === 'approved' ? 'bg-green-50 border-green-200' :
                    order.status === 'rejected' ? 'bg-red-50 border-red-200' :
                    'bg-slate-50 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        order.status === 'approved' ? 'bg-green-100 text-green-600' :
                        order.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.status === 'approved' ? <Check className="w-5 h-5" /> :
                         order.status === 'rejected' ? <X className="w-5 h-5" /> :
                         <Clock className="w-5 h-5" />}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{order.order_no}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'approved' ? 'bg-green-100 text-green-700' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status === 'approved' ? '已通过' :
                             order.status === 'rejected' ? '已拒绝' : '待审核'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{order.customer_name || '未知客户'}</span>
                          </div>
                          {order.shipping_address && (
                            <div className="flex items-start gap-2 text-slate-500">
                              <Package className="w-3 h-3 text-slate-400 mt-0.5" />
                              <span className="truncate max-w-xs">
                                {order.shipping_address.name} {order.shipping_address.phone}
                              </span>
                            </div>
                          )}
                          {order.shipping_address?.address && (
                            <div className="flex items-start gap-2 text-slate-500 pl-5">
                              <span className="truncate max-w-xs">{order.shipping_address.address}</span>
                            </div>
                          )}
                          {order.remark && (
                              <div className="flex items-start gap-2 text-slate-500">
                                <span className="w-3 h-3 text-slate-400 mt-0.5">📝</span>
                                <span className="truncate max-w-xs">{order.remark}</span>
                              </div>
                            )}

                            {order.items && order.items.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-xs font-medium text-slate-500 mb-2">商品明细</h4>
                              <div className="space-y-1">
                                {order.items.slice(0, 3).map((item, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 truncate max-w-xs">{item.product_name} x{item.quantity}</span>
                                    <span className="font-medium text-slate-800">¥{Number(item.subtotal).toFixed(2)}</span>
                                  </div>
                                ))}
                                {order.items.length > 3 && (
                                  <p className="text-xs text-slate-400 mt-1">还有 {order.items.length - 3} 件商品...</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">¥{Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-sm text-slate-400">{order.created_at}</p>
                      </div>
                      {order.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReject(order.id)}
                            className="px-4 py-2 text-sm text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            拒绝
                          </button>
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-indigo-500/20"
                          >
                            通过
                          </button>
                        </div>
                      )}
                      {order.status !== 'pending' && (
                        <button className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                          查看详情
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}