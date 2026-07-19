import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Search, Filter, Plus, MoreVertical, Mail, Phone, Building, Loader2, X, Save, Calendar, FileText, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { customerApi, type Customer, type CustomerStatus } from '../api/customer';
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

const provinces = [
  { name: '请选择省份', cities: [] },
  { name: '北京市', cities: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '顺义区'] },
  { name: '上海市', cities: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区'] },
  { name: '广东省', cities: ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市'] },
  { name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市'] },
  { name: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '扬州市', '泰州市', '南通市'] },
  { name: '四川省', cities: ['成都市', '绵阳市', '德阳市', '攀枝花市', '泸州市', '广元市', '遂宁市', '内江市'] },
  { name: '湖北省', cities: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市'] },
  { name: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市'] },
  { name: '山东省', cities: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市'] },
  { name: '河南省', cities: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市'] },
  { name: '福建省', cities: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市'] },
  { name: '安徽省', cities: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市'] },
  { name: '河北省', cities: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市'] },
  { name: '江西省', cities: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市'] },
];

const statusOptions: { value: string; label: string }[] = [
  { value: '全部', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'inactive', label: '不活跃' },
  { value: 'lost', label: '流失' },
];

const sourceOptions = ['全部', '线上渠道', '转介绍', '展会', '电话营销'];

export function CustomerList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [sourceFilter, setSourceFilter] = useState('全部');
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    phone_code: '+86',
    wechat: '',
    company: '',
    address: '',
    province: '',
    city: '',
    district: '',
    street: '',
    source: '',
    status: 'active' as CustomerStatus,
    remark: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    phone_code: '+86',
    wechat: '',
    company: '',
    address: '',
    province: '',
    city: '',
    district: '',
    street: '',
    source: '',
    status: 'active' as CustomerStatus,
    remark: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dropdownCustomerId, setDropdownCustomerId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [followupForm, setFollowupForm] = useState({
    customer_id: 0,
    content: '',
    followup_time: '',
    result: 'pending' as 'pending' | 'success' | 'failed',
    next_followup_time: '',
  });

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: { page?: number; pageSize?: number; search?: string; status?: CustomerStatus; source?: string } = {
        page: currentPage,
        pageSize: 10,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== '全部') params.status = statusFilter as CustomerStatus;
      if (sourceFilter !== '全部') params.source = sourceFilter;

      const result = await customerApi.getList(params);
      setCustomers(result.data);
      setTotal(result.total);
    } catch (err: any) {
      console.error('获取客户列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, statusFilter, sourceFilter]);

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

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  const validateCustomerForm = (form: typeof addForm) => {
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
      if (form.phone_code === '+86') {
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

  const handleAddCustomer = async () => {
    const errors = validateCustomerForm(addForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const address = [addForm.province, addForm.city, addForm.district, addForm.street].filter(Boolean).join(' ');
      await customerApi.create({ 
        ...addForm, 
        created_by: user?.id || 1,
        address,
      });
      setShowAddModal(false);
      setAddForm({ name: '', email: '', phone: '', phone_code: '+86', wechat: '', company: '', address: '', province: '', city: '', district: '', street: '', source: '', status: 'active', remark: '' });
      setFormErrors({});
      fetchCustomers();
    } catch (err) {
      console.error('添加客户失败:', err);
    }
  };

  const handleAddFollowup = async () => {
    if (!followupForm.content) {
      alert('请填写回访内容');
      return;
    }
    try {
      await customerApi.createFollowup(followupForm.customer_id, {
        ...followupForm,
        user_id: user?.id || 1,
        followup_time: followupForm.followup_time || new Date().toISOString(),
      });
      setShowFollowupModal(false);
      setFollowupForm({ customer_id: 0, content: '', followup_time: '', result: 'pending', next_followup_time: '' });
      fetchCustomers();
    } catch (err) {
      console.error('添加回访失败:', err);
    }
  };

  const openFollowupModal = (customerId: number) => {
    setFollowupForm({
      customer_id: customerId,
      content: '',
      followup_time: '',
      result: 'pending',
      next_followup_time: '',
    });
    setShowFollowupModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      phone_code: customer.phone_code || '+86',
      wechat: customer.wechat || '',
      company: customer.company,
      address: customer.address,
      province: customer.province || '',
      city: customer.city || '',
      district: customer.district || '',
      street: customer.street || '',
      source: customer.source,
      status: customer.status,
      remark: customer.remark,
    });
    setShowEditModal(true);
  };

  const handleEditCustomer = async () => {
    const errors = validateCustomerForm(editForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const address = [editForm.province, editForm.city, editForm.district, editForm.street].filter(Boolean).join(' ');
      await customerApi.update(editingCustomerId!, { ...editForm, address });
      setShowEditModal(false);
      setEditingCustomerId(null);
      setFormErrors({});
      fetchCustomers();
    } catch (err) {
      console.error('编辑客户失败:', err);
    }
  };

  const toggleDropdown = (customerId: number) => {
    setDropdownCustomerId(dropdownCustomerId === customerId ? null : customerId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownCustomerId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDeleteConfirm = (customerId: number) => {
    setDeletingCustomerId(customerId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomerId) return;
    try {
      await customerApi.delete(deletingCustomerId);
      fetchCustomers();
    } catch (err) {
      console.error('删除客户失败:', err);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingCustomerId(null);
    }
  };

  const totalPages = Math.ceil(total / 10);
  const visiblePages = [];
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    visiblePages.push(i);
  }

  return (
    <Layout title="客户列表">
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
                  placeholder="搜索客户名称、公司或电话..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                添加客户
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">状态:</span>
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-lg transition-colors',
                    statusFilter === option.value
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">来源:</span>
              {sourceOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setSourceFilter(option)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-lg transition-colors',
                    sourceFilter === option
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {option}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">客户信息</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">来源</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-slate-500">加载中...</p>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-500">暂无数据</p>
                    </td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr
                      key={customer.id}
                      className={cn(
                        'hover:bg-slate-50 transition-colors cursor-pointer',
                        selectedCustomer === customer.id && 'bg-indigo-50'
                      )}
                      onClick={() => navigate(`/customer-details/${customer.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {customer.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{customer.name}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {customer.company || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {formatPhone(customer.phone) || '-'}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {customer.email || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {getStatusText(customer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{customer.source || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{new Date(customer.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); openFollowupModal(customer.id); }}
                                className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="新建回访"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(customer); }}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="编辑客户"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openDeleteConfirm(customer.id); }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="删除客户"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <div className="relative" ref={dropdownCustomerId === customer.id ? dropdownRef : null}>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleDropdown(customer.id); }}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                dropdownCustomerId === customer.id
                                  ? 'text-indigo-600 bg-indigo-50'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              )}
                              title="更多操作"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {dropdownCustomerId === customer.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openFollowupModal(customer.id); setDropdownCustomerId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Calendar className="w-4 h-4" />
                                  新建回访
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditModal(customer); setDropdownCustomerId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  编辑客户
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openDeleteConfirm(customer.id); setDropdownCustomerId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  删除客户
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
                  className={cn(
                    'px-3 py-1 text-sm rounded-lg transition-colors',
                    currentPage === page
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  )}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">添加客户</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  )}
                  placeholder="请输入客户名称（不能包含特殊符号）"
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                <div className="flex gap-2">
                  <select
                    value={addForm.phone_code}
                    onChange={(e) => setAddForm({ ...addForm, phone_code: e.target.value })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {phoneCodes.map(pc => (
                      <option key={pc.code} value={pc.code}>{pc.code} ({pc.country})</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className={cn(
                      'flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                      formErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    )}
                    placeholder={addForm.phone_code === '+86' ? '请输入11位手机号' : '请输入电话号码'}
                  />
                </div>
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
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
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={addForm.wechat}
                    onChange={(e) => setAddForm({ ...addForm, wechat: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="请输入微信号"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公司名称</label>
                <input
                  type="text"
                  value={addForm.company}
                  onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入公司名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">来源</label>
                  <select
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">请选择来源</option>
                    {sourceOptions.filter(o => o !== '全部').map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as CustomerStatus })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {statusOptions.filter(o => o.value !== '全部').map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">地址选择</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={addForm.province}
                    onChange={(e) => {
                      setAddForm({ ...addForm, province: e.target.value, city: '', district: '' });
                    }}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">请选择省份</option>
                    {provinces.filter(p => p.name !== '请选择省份').map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value, district: '' })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    disabled={!addForm.province}
                  >
                    <option value="">请选择城市</option>
                    {provinces.find(p => p.name === addForm.province)?.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={addForm.district}
                  onChange={(e) => setAddForm({ ...addForm, district: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-2"
                  placeholder="请输入区县"
                />
                <input
                  type="text"
                  value={addForm.street}
                  onChange={(e) => setAddForm({ ...addForm, street: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入街道/详细地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
                <textarea
                  value={addForm.remark}
                  onChange={(e) => setAddForm({ ...addForm, remark: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  rows={3}
                  placeholder="请输入备注信息"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">新建回访</h2>
              <button onClick={() => setShowFollowupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">回访内容 *</label>
                <textarea
                  value={followupForm.content}
                  onChange={(e) => setFollowupForm({ ...followupForm, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  rows={4}
                  placeholder="请输入回访内容"
                />
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
                    onChange={(e) => setFollowupForm({ ...followupForm, result: e.target.value as 'pending' | 'success' | 'failed' })}
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
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFollowupModal(false)}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddFollowup}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">编辑客户</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
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
                  placeholder="请输入客户名称（不能包含特殊符号）"
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
                    placeholder={editForm.phone_code === '+86' ? '请输入11位手机号' : '请输入电话号码'}
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
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={editForm.wechat}
                    onChange={(e) => setEditForm({ ...editForm, wechat: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="请输入微信号"
                  />
                </div>
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
                    {sourceOptions.filter(o => o !== '全部').map(o => (
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
                    {statusOptions.filter(o => o.value !== '全部').map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">地址选择</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={editForm.province}
                    onChange={(e) => {
                      setEditForm({ ...editForm, province: e.target.value, city: '', district: '' });
                    }}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">请选择省份</option>
                    {provinces.filter(p => p.name !== '请选择省份').map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value, district: '' })}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    disabled={!editForm.province}
                  >
                    <option value="">请选择城市</option>
                    {provinces.find(p => p.name === editForm.province)?.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-2"
                  placeholder="请输入区县"
                />
                <input
                  type="text"
                  value={editForm.street}
                  onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入街道/详细地址"
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
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditCustomer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
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
            <p className="text-sm text-slate-600 mb-6">确定要删除这个客户吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletingCustomerId(null); }}
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
    </Layout>
  );
}