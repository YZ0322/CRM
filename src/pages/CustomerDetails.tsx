import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { User, Mail, Phone, Building, MapPin, MessageCircle, Calendar, ChevronLeft, Edit2, Trash2, Plus, X, Save, Clock, Check, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { customerApi, type Customer, type Followup, type FollowupResult, type CustomerStatus } from '../api/customer';
import { useAuthStore } from '../hooks/useAuthStore';

const phoneCodes = [
  { code: '+86', country: '中国' },
  { code: '+1', country: '美国' },
  { code: '+44', country: '英国' },
  { code: '+81', country: '日本' },
  { code: '+82', country: '韩国' },
  { code: '+65', country: '新加坡' },
  { code: '+852', country: '香港' },
  { code: '+886', country: '台湾' },
  { code: '+61', country: '澳大利亚' },
];

const statusOptions: { value: CustomerStatus; label: string }[] = [
  { value: 'active', label: '活跃' },
  { value: 'inactive', label: '不活跃' },
  { value: 'lost', label: '流失' },
];

const sourceOptions = ['线上渠道', '转介绍', '展会', '电话营销'];

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showFollowupDetail, setShowFollowupDetail] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<Followup | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [followupForm, setFollowupForm] = useState({
    content: '',
    followup_time: '',
    result: 'pending' as FollowupResult,
    next_followup_time: '',
  });

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      const customerId = Number(id);
      if (isNaN(customerId) || customerId <= 0) return;

      setLoading(true);
      try {
        const [customerData, followupData] = await Promise.all([
          customerApi.getDetail(customerId),
          customerApi.getFollowups(customerId),
        ]);
        setCustomer(customerData);
        setFollowups(followupData);
        setEditForm({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          phone_code: customerData.phone_code || '+86',
          wechat: customerData.wechat || '',
          company: customerData.company,
          address: customerData.address,
          province: customerData.province || '',
          city: customerData.city || '',
          district: customerData.district || '',
          street: customerData.street || '',
          source: customerData.source,
          status: customerData.status,
          remark: customerData.remark,
        });
      } catch (err) {
        console.error('获取客户详情失败:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-slate-100 text-slate-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: CustomerStatus) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '不活跃';
      case 'lost': return '流失';
      default: return status;
    }
  };

  const getFollowupResultColor = (result: FollowupResult) => {
    switch (result) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'success': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getFollowupResultText = (result: FollowupResult) => {
    switch (result) {
      case 'pending': return '进行中';
      case 'success': return '成功';
      case 'failed': return '失败';
      default: return result;
    }
  };

  const validateCustomerForm = (form: typeof editForm) => {
    const errors: Record<string, string> = {};
    if (!form.name?.trim()) {
      errors.name = '请填写客户名称';
    } else if (/[<>{}[\]|`~!@#$%^&*()+=;:'"\\/?]/g.test(form.name)) {
      errors.name = '客户名称不能包含特殊符号';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    if (form.phone) {
      const phoneNumber = form.phone.replace(/\s/g, '');
      if ((form.phone_code || '+86') === '+86') {
        if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
          errors.phone = '请输入有效的手机号码';
        }
      } else {
        if (phoneNumber.length < 7 || phoneNumber.length > 15) {
          errors.phone = '电话号码长度需在7-15位之间';
        }
        if (!/^\d+$/.test(phoneNumber)) {
          errors.phone = '电话号码只能包含数字';
        }
      }
    }
    return errors;
  };

  const handleEditCustomer = async () => {
    const errors = validateCustomerForm(editForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const address = [editForm.province, editForm.city, editForm.district, editForm.street]
        .filter(Boolean)
        .join(' ');
      await customerApi.update(Number(id), { ...editForm, address });
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error('编辑客户失败:', err);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await customerApi.delete(Number(id));
      navigate('/customers');
    } catch (err) {
      console.error('删除客户失败:', err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleAddFollowup = async () => {
    if (!followupForm.content?.trim()) {
      setFormErrors({ followup: '请填写回访内容' });
      return;
    }
    try {
      await customerApi.createFollowup(Number(id), {
        user_id: user?.id || 1,
        followup_time: followupForm.followup_time || new Date().toISOString(),
        content: followupForm.content,
        result: followupForm.result,
        next_followup_time: followupForm.next_followup_time || undefined,
      });
      setShowFollowupModal(false);
      setFollowupForm({ content: '', followup_time: '', result: 'pending', next_followup_time: '' });
      setFormErrors({});
      window.location.reload();
    } catch (err) {
      console.error('添加回访失败:', err);
    }
  };

  const openFollowupDetail = (followup: Followup) => {
    setSelectedFollowup(followup);
    setShowFollowupDetail(true);
  };

  if (loading) {
    return (
      <Layout title="客户详情">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout title="客户详情">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">客户不存在</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`客户详情 - ${customer.name}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/customers')} className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            返回客户列表
          </button>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                编辑客户
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除客户
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                  {customer.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{customer.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                    {getStatusText(customer.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">联系电话</span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {customer.phone_code || '+86'} {customer.phone || '-'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">邮箱</span>
                  </div>
                  <p className="font-medium text-slate-800">{customer.email || '-'}</p>
                </div>
                {customer.wechat && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">微信号</span>
                    </div>
                    <p className="font-medium text-slate-800">{customer.wechat}</p>
                  </div>
                )}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="text-sm">公司</span>
                  </div>
                  <p className="font-medium text-slate-800">{customer.company || '-'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">地址</span>
                  </div>
                  <p className="font-medium text-slate-800">{customer.address || '-'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">来源</span>
                  </div>
                  <p className="font-medium text-slate-800">{customer.source || '-'}</p>
                </div>
              </div>

              {customer.remark && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">备注</h3>
                  <p className="text-slate-700">{customer.remark}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-800">回访记录</h2>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                    {followups.length}
                  </span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowFollowupModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    新建回访
                  </button>
                )}
              </div>

              {followups.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">暂无回访记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followups.map(followup => (
                    <div
                      key={followup.id}
                      className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => openFollowupDetail(followup)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getFollowupResultColor(followup.result)}`}>
                              {getFollowupResultText(followup.result)}
                            </span>
                            <span className="text-sm text-slate-500">
                              {new Date(followup.followup_time).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-700 line-clamp-2">{followup.content}</p>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">编辑客户</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={cn(
                      'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                      formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    )}
                    placeholder="请输入客户名称"
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                  <div className="flex gap-2">
                    <select
                      value={editForm.phone_code}
                      onChange={(e) => setEditForm({ ...editForm, phone_code: e.target.value })}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {phoneCodes.map(pc => (
                        <option key={pc.code} value={pc.code}>{pc.code} ({pc.country})</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className={cn(
                        'flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                        formErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      )}
                      placeholder="请输入电话号码"
                    />
                  </div>
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={cn(
                      'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                      formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    )}
                    placeholder="请输入邮箱地址"
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">微信号</label>
                  <input
                    type="text"
                    value={editForm.wechat}
                    onChange={(e) => setEditForm({ ...editForm, wechat: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="请输入微信号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">公司名称</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="请输入公司名称"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">来源</label>
                    <select
                      value={editForm.source}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="">请选择来源</option>
                      {sourceOptions.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CustomerStatus })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {statusOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">地址</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="请输入地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                  <textarea
                    value={editForm.remark}
                    onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    rows={3}
                    placeholder="请输入备注信息"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditCustomer}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">确认删除</h3>
                  <p className="text-sm text-slate-500">删除后将无法恢复</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">确定要删除客户「{customer.name}」吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  className="flex-1 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}

        {showFollowupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">新建回访</h3>
                <button onClick={() => setShowFollowupModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">回访内容 *</label>
                  <textarea
                    value={followupForm.content}
                    onChange={(e) => setFollowupForm({ ...followupForm, content: e.target.value })}
                    className={cn(
                      'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none',
                      formErrors.followup ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    )}
                    rows={4}
                    placeholder="请输入回访内容"
                  />
                  {formErrors.followup && <p className="text-xs text-red-500 mt-1">{formErrors.followup}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">回访时间</label>
                    <input
                      type="datetime-local"
                      value={followupForm.followup_time}
                      onChange={(e) => setFollowupForm({ ...followupForm, followup_time: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">回访结果</label>
                    <select
                      value={followupForm.result}
                      onChange={(e) => setFollowupForm({ ...followupForm, result: e.target.value as FollowupResult })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="pending">进行中</option>
                      <option value="success">成功</option>
                      <option value="failed">失败</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">下次回访时间</label>
                  <input
                    type="datetime-local"
                    value={followupForm.next_followup_time}
                    onChange={(e) => setFollowupForm({ ...followupForm, next_followup_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowFollowupModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddFollowup}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {showFollowupDetail && selectedFollowup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">回访详情</h3>
                <button onClick={() => setShowFollowupDetail(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getFollowupResultColor(selectedFollowup.result)}`}>
                    {selectedFollowup.result === 'success' ? <Check className="w-6 h-6" /> :
                     selectedFollowup.result === 'failed' ? <X className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{customer.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getFollowupResultColor(selectedFollowup.result)}`}>
                      {getFollowupResultText(selectedFollowup.result)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">回访内容</label>
                  <p className="text-slate-800 whitespace-pre-wrap">{selectedFollowup.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">回访时间</label>
                    <p className="text-slate-700">{new Date(selectedFollowup.followup_time).toLocaleString()}</p>
                  </div>
                  {selectedFollowup.next_followup_time && (
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">下次回访时间</label>
                      <p className="text-slate-700">{new Date(selectedFollowup.next_followup_time).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">创建时间</label>
                  <p className="text-sm text-slate-500">{new Date(selectedFollowup.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50">
                <button
                  onClick={() => setShowFollowupDetail(false)}
                  className="w-full px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}