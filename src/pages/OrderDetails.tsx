import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Package, User, MapPin, Clock, CreditCard, FileText, ChevronLeft, Truck, Check, AlertCircle, X, Save } from 'lucide-react';
import { orderApi } from '../api/order';
import { useAuthStore } from '../hooks/useAuthStore';

interface OrderDetailsData {
  id: number;
  order_no: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer_id: number;
  customer_name: string;
  user_id: number;
  total_amount: number;
  shipping_address: { name: string; phone: string; address: string };
  remark: string;
  approved_at?: string;
  approved_by?: number;
  shipped_at?: string;
  shipped_by?: number;
  shipping_company?: string;
  tracking_number?: string;
  tracking_history?: { time: string; status: string; location: string }[];
  completed_at?: string;
}

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    shipping_company: '',
    tracking_number: '',
  });

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = Number(id);
      if (isNaN(orderId) || orderId <= 0) return;
      
      setLoading(true);
      try {
        const result = await orderApi.getDetail(orderId);
        setOrder(result);
        if (result?.shipping_company) {
          setTrackingForm({
            shipping_company: result.shipping_company,
            tracking_number: result.tracking_number || '',
          });
        }
      } catch (err) {
        console.error('获取订单详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSaveTracking = async () => {
    if (!trackingForm.shipping_company || !trackingForm.tracking_number) {
      alert('请填写完整的物流信息');
      return;
    }
    try {
      await orderApi.updateTracking(Number(id), trackingForm.tracking_number, trackingForm.shipping_company);
      setShowTrackingModal(false);
      window.location.reload();
    } catch (err) {
      console.error('保存物流信息失败:', err);
    }
  };

  if (loading) {
    return (
      <Layout title={`订单详情 ${id}`}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="订单详情">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">订单不存在</p>
        </div>
      </Layout>
    );
  }

  const trackingHistory = order.tracking_history || [
    { time: '2024-01-15 14:30:00', status: '已发货', location: '北京仓库' },
    { time: '2024-01-15 18:00:00', status: '运输中', location: '北京转运中心' },
    { time: '2024-01-16 10:00:00', status: '派送中', location: '上海市浦东新区' },
    { time: '2024-01-16 14:30:00', status: '已签收', location: '客户地址' },
  ];

  return (
    <Layout title={`订单详情 ${order.order_no}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            返回订单列表
          </button>
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">订单信息</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">订单编号</p>
                  <p className="font-medium text-slate-800">{order.order_no}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">下单时间</p>
                  <p className="font-medium text-slate-800">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                {order.approved_at && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">审核时间</p>
                    <p className="font-medium text-slate-800">{new Date(order.approved_at).toLocaleString()}</p>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">发货时间</p>
                    <p className="font-medium text-slate-800">{new Date(order.shipped_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {order.status === 'shipped' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">物流信息</h2>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setShowTrackingModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                      编辑物流
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">物流公司</p>
                    <p className="font-medium text-slate-800">{order.shipping_company || '未填写'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">运单号</p>
                    <p className="font-medium text-slate-800">{order.tracking_number || '未填写'}</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  <div className="space-y-4">
                    {trackingHistory.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index === trackingHistory.length - 1 ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-200'
                        }`}>
                          {index === trackingHistory.length - 1 ? <Check className="w-4 h-4" /> : <span className="text-xs text-slate-500">{index + 1}</span>}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${index === trackingHistory.length - 1 ? 'text-green-600' : 'text-slate-800'}`}>
                              {item.status}
                            </span>
                            <span className="text-sm text-slate-500">{item.time}</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{item.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">费用明细</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">商品总价</span>
                  <span className="text-slate-800">¥{Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">优惠折扣</span>
                  <span className="text-green-600">-¥0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">运费</span>
                  <span className="text-green-600">免运费</span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">实付金额</span>
                    <span className="text-xl font-bold text-indigo-600">¥{Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">订单备注</h2>
              </div>
              <p className="text-slate-600">{order.remark || '无备注'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">客户信息</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">客户姓名</p>
                  <p className="font-medium text-slate-800">{order.customer_name || '未知客户'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">客户ID</p>
                  <p className="text-sm text-slate-600">{order.customer_id}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">收货地址</h2>
              </div>
              <p className="font-medium text-slate-800 mb-1">{order.shipping_address.name}</p>
              <p className="text-sm text-slate-500 mb-1">{order.shipping_address.phone}</p>
              <p className="text-slate-600">{order.shipping_address.address || '未填写'}</p>
            </div>
          </div>
        </div>
      </div>

      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">编辑物流信息</h3>
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
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

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );
}