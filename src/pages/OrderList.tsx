import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, Filter, FileText, ChevronRight, Package, Truck, Edit2, X, Save } from 'lucide-react';
import { orderApi } from '../api/order';
import { useAuthStore } from '../hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Order {
  id: number;
  order_no: string;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_company?: string;
  tracking_number?: string;
}

const statusOptions = [
  { value: '全部', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'paid', label: '已支付' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refund_pending', label: '退款中' },
  { value: 'refunded', label: '已退款' },
  { value: 'return_pending', label: '退货中' },
  { value: 'returned', label: '已退货' },
];

export function OrderList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    shipping_company: '',
    tracking_number: '',
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: { page?: number; pageSize?: number; status?: string; search?: string } = {
        page: currentPage,
        pageSize: 10,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== '全部') params.status = statusFilter;

      const result = await orderApi.getList(params);
      setOrders(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('获取订单列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'refund_pending': return 'bg-purple-100 text-purple-700';
      case 'refunded': return 'bg-slate-100 text-slate-700';
      case 'return_pending': return 'bg-orange-100 text-orange-700';
      case 'returned': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'paid': return '已支付';
      case 'shipped': return '已发货';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      case 'refund_pending': return '退款中';
      case 'refunded': return '已退款';
      case 'return_pending': return '退货中';
      case 'returned': return '已退货';
      default: return status;
    }
  };

  const totalPages = Math.ceil(total / 10);
  const visiblePages = [];
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    visiblePages.push(i);
  }

  const openTrackingModal = (order: Order) => {
    setEditingOrder(order);
    setTrackingForm({
      shipping_company: order.shipping_company || '',
      tracking_number: order.tracking_number || '',
    });
    setShowTrackingModal(true);
  };

  const handleSaveTracking = async () => {
    if (!editingOrder || !trackingForm.shipping_company || !trackingForm.tracking_number) {
      return;
    }
    try {
      await orderApi.updateTracking(editingOrder.id, trackingForm.tracking_number, trackingForm.shipping_company);
      setShowTrackingModal(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('保存物流信息失败:', err);
    }
  };

  return (
    <Layout title="订单列表">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索订单编号..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-indigo-500/20">
              <Package className="w-4 h-4" />
              新建订单
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">状态:</span>
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    statusFilter === option.value
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">订单编号</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户姓名</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">订单金额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">物流信息</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-sm text-slate-500">加载中...</p>
                  </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-sm text-slate-500">暂无订单数据</p>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/order-details/${order.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-indigo-600">{order.order_no}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{order.customer_name || '未知客户'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">¥{Number(order.total_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'shipped' ? (
                          order.tracking_number ? (
                            <span className="text-sm text-slate-600">
                              {order.shipping_company && <span className="text-indigo-600 font-medium">{order.shipping_company}</span>}
                              <span className="ml-2">{order.tracking_number}</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                未填写物流单号
                              </span>
                              {canEdit && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openTrackingModal(order);
                                  }}
                                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  填写
                                </button>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/order-details/${order.id}`);
                          }}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          查看详情
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500">共 {total} 条记录</p>
              <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                <FileText className="w-4 h-4" />
                导出数据
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              {visiblePages.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTrackingModal && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">填写物流信息</h3>
                <p className="text-sm text-slate-500">订单号: {editingOrder.order_no}</p>
              </div>
              <button onClick={() => setShowTrackingModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">物流公司 *</label>
                <input
                  type="text"
                  value={trackingForm.shipping_company}
                  onChange={(e) => setTrackingForm({ ...trackingForm, shipping_company: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入物流公司名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">运单号 *</label>
                <input
                  type="text"
                  value={trackingForm.tracking_number}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入运单号"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTracking}
                disabled={!trackingForm.shipping_company || !trackingForm.tracking_number}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}