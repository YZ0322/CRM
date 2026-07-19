import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Package, Truck, RefreshCcw, ArrowLeftRight, FileText, Search } from 'lucide-react';
import { orderApi } from '../api/order';
import { useAuthStore } from '../hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: number;
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderStatusPageProps {
  title: string;
  status: 'approved' | 'shipped' | 'refund_pending' | 'return_pending';
  apiStatus: string;
  icon: React.ElementType;
}

function OrderStatusPage({ title, status, apiStatus, icon: Icon }: OrderStatusPageProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await orderApi.getList({ status: apiStatus });
      setOrders(result.data);
    } catch (err) {
      console.error(`获取${title}失败:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o =>
    o.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'bg-orange-100 text-orange-700';
      case 'shipped': return 'bg-green-100 text-green-700';
      case 'refund_pending': return 'bg-blue-100 text-blue-700';
      case 'return_pending': return 'bg-red-100 text-red-700';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'approved': return '确认发货';
      case 'shipped': return '查看物流';
      case 'refund_pending': return '处理退款';
      case 'return_pending': return '确认退货';
    }
  };

  const handleAction = async (orderId: number) => {
    try {
      switch (status) {
        case 'approved':
          await orderApi.ship(orderId, user?.id || 1);
          break;
        case 'refund_pending':
          await orderApi.processRefund(orderId);
          break;
        case 'return_pending':
          await orderApi.confirmReturn(orderId);
          break;
      }
      fetchOrders();
    } catch (err) {
      console.error('操作失败:', err);
    }
  };

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <Layout title={title}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${getStatusColor()} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-slate-500">共 {filteredOrders.length} 条记录</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索订单号或客户..."
                className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">订单编号</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户信息</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">订单金额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">下单时间</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-24"></div></td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无{title}</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-indigo-600">{order.order_no}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{order.customer_name || '未知客户'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">¥{Number(order.total_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{order.created_at}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canEdit && status !== 'shipped' ? (
                            <button
                              onClick={() => handleAction(order.id)}
                              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                status === 'approved' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                status === 'refund_pending' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {getButtonText()}
                            </button>
                          ) : status === 'shipped' ? (
                            <button onClick={() => navigate(`/order-details/${order.id}`)} className="px-4 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors">
                              查看物流
                            </button>
                          ) : (
                          <button className="px-4 py-2 text-sm text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed">
                            {getButtonText()}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function UnshippedOrders() {
  return <OrderStatusPage title="未发货订单" status="approved" apiStatus="approved" icon={Package} />;
}

export function ShippedOrders() {
  return <OrderStatusPage title="已发货订单" status="shipped" apiStatus="shipped" icon={Truck} />;
}

export function RefundOrders() {
  return <OrderStatusPage title="仅退款订单" status="refund_pending" apiStatus="refund_pending" icon={RefreshCcw} />;
}

export function ReturnOrders() {
  return <OrderStatusPage title="退货退款订单" status="return_pending" apiStatus="return_pending" icon={ArrowLeftRight} />;
}

export function OrderSummary() {
  const [summaryData, setSummaryData] = useState([
    { label: '总订单数', value: '0', change: '+0%', trend: 'up' },
    { label: '总销售额', value: '¥0', change: '+0%', trend: 'up' },
    { label: '待发货', value: '0', change: '+0%', trend: 'up' },
    { label: '已完成', value: '0', change: '+0%', trend: 'up' },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const [all, approved, completed] = await Promise.all([
          orderApi.getList({ pageSize: 1 }),
          orderApi.getList({ status: 'approved', pageSize: 1 }),
          orderApi.getList({ status: 'completed', pageSize: 1 }),
        ]);
        
        const totalAmount = all.data.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
        
        setSummaryData([
          { label: '总订单数', value: String(all.total), change: '+0%', trend: 'up' as const },
          { label: '总销售额', value: `¥${totalAmount.toLocaleString()}`, change: '+0%', trend: 'up' as const },
          { label: '待发货', value: String(approved.data.length), change: '+0%', trend: 'up' as const },
          { label: '已完成', value: String(completed.data.length), change: '+0%', trend: 'up' as const },
        ]);
      } catch (err) {
        console.error('获取订单汇总失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const monthlyData = [
    { month: '7月', orders: 120, amount: '¥18,500' },
    { month: '8月', orders: 145, amount: '¥22,300' },
    { month: '9月', orders: 132, amount: '¥20,100' },
    { month: '10月', orders: 168, amount: '¥26,800' },
    { month: '11月', orders: 195, amount: '¥30,200' },
    { month: '12月', orders: 196, amount: '¥30,660' },
  ];

  return (
    <Layout title="数据汇总">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-24 mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-32"></div>
              </div>
            ))
          ) : (
            summaryData.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm mb-1">{item.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                  <span className={`text-sm ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">月度订单统计</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all">
              <FileText className="w-4 h-4" />
              导出数据
            </button>
          </div>
          <div className="h-64 flex items-end gap-4">
            {monthlyData.map((item, index) => (
              <div key={index} className="flex-1 group relative">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 group-hover:opacity-90"
                  style={{ height: `${(item.orders / 200) * 100}%` }}
                  title={`订单数: ${item.orders}\n金额: ${item.amount}`}
                />
                <p className="text-center text-sm text-slate-500 mt-2">{item.month}</p>
                <p className="text-center text-xs text-slate-400">{item.orders}单</p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}