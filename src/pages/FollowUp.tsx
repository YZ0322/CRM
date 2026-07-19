import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Calendar, Clock, User, MessageSquare, Plus, Check, Bell, ChevronLeft, ChevronRight, X, Save, Filter, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { customerApi, Followup, FollowupResult } from '../api/customer';
import { useAuthStore } from '../hooks/useAuthStore';

export function FollowUp() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'records' | 'schedule'>('records');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [followupRecords, setFollowupRecords] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Followup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<FollowupResult | 'all'>('all');
  const [customerOptions, setCustomerOptions] = useState<{ id: number; name: string }[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [createForm, setCreateForm] = useState({
    customer_id: '',
    followup_time: '',
    content: '',
    result: 'pending' as FollowupResult,
    next_followup_time: '',
  });

  useEffect(() => {
    fetchFollowups();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const customers = await customerApi.getList({ pageSize: 100 });
      setCustomerOptions(customers.data.map(c => ({ id: c.id, name: c.name })));
    } catch (err) {
      console.error('获取客户列表失败:', err);
    }
  };

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const allCustomers = await customerApi.getList({ pageSize: 100 });
      const followups: Followup[] = [];
      for (const customer of allCustomers.data) {
        const customerFollowups = await customerApi.getFollowups(customer.id);
        followups.push(...customerFollowups.map(f => ({ ...f, customer_name: customer.name })));
      }
      followups.sort((a, b) => new Date(b.followup_time).getTime() - new Date(a.followup_time).getTime());
      setFollowupRecords(followups);
    } catch (err) {
      console.error('获取回访记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    monthDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(i);
  }

  const isToday = (day: number) => {
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const filteredRecords = followupRecords.filter(record => {
    const matchSearch = !searchTerm || (record as any).customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchResult = filterResult === 'all' || record.result === filterResult;
    return matchSearch && matchResult;
  });

  const handleCreateFollowup = async () => {
    const errors: Record<string, string> = {};
    if (!createForm.customer_id) {
      errors.customer_id = '请选择客户';
    }
    if (!createForm.followup_time) {
      errors.followup_time = '请选择回访时间';
    }
    if (!createForm.content?.trim()) {
      errors.content = '请填写回访内容';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      await customerApi.createFollowup(Number(createForm.customer_id), {
        user_id: user?.id || 1,
        followup_time: createForm.followup_time,
        content: createForm.content,
        result: createForm.result,
        next_followup_time: createForm.next_followup_time || undefined,
      });
      setShowCreateModal(false);
      setCreateForm({
        customer_id: '',
        followup_time: '',
        content: '',
        result: 'pending',
        next_followup_time: '',
      });
      setFormErrors({});
      fetchFollowups();
    } catch (err) {
      console.error('创建回访失败:', err);
      setFormErrors({ submit: '创建回访失败，请稍后重试' });
    }
  };

  const getResultText = (result: FollowupResult) => {
    switch (result) {
      case 'pending': return '待跟进';
      case 'success': return '成功';
      case 'failed': return '失败';
      default: return result;
    }
  };

  const getResultColor = (result: FollowupResult) => {
    switch (result) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'success': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const openDetailModal = (record: Followup) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <Layout title="客户回访">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('records')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'records'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                <MessageSquare className="w-4 h-4" />
                回访记录
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'schedule'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                <Calendar className="w-4 h-4" />
                日程看板
              </button>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-indigo-500/20">
              <Plus className="w-4 h-4" />
              新建回访
            </button>
          </div>

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索客户名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value as FollowupResult | 'all')}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待跟进</option>
                    <option value="success">成功</option>
                    <option value="failed">失败</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">暂无回访记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <div
                      key={record.id}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => openDetailModal(record)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.result === 'success' ? 'bg-green-100 text-green-600' :
                        record.result === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {record.result === 'success' ? <Check className="w-5 h-5" /> :
                         record.result === 'failed' ? <X className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-slate-800">{(record as any).customer_name || '未知客户'}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getResultColor(record.result)}`}>
                            {getResultText(record.result)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{record.content}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(record.followup_time).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(record.followup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {record.next_followup_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              下次回访: {new Date(record.next_followup_time).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h3 className="font-medium text-slate-800">
                      {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                    </h3>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                      <span key={day} className="text-xs text-slate-500">{day}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthDays.map((day, index) => (
                      <button
                        key={index}
                        className={cn(
                          'h-8 rounded-lg text-sm flex items-center justify-center transition-colors',
                          day === null && 'invisible',
                          day !== null && !isToday(day) && 'hover:bg-slate-200 text-slate-600',
                          isToday(day) && 'bg-indigo-600 text-white font-medium'
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">今日回访安排</h4>
                  <div className="space-y-3">
                    {filteredRecords
                      .filter(r => {
                        const followupDate = new Date(r.followup_time);
                        return followupDate.toDateString() === today.toDateString();
                      })
                      .slice(0, 5)
                      .map(record => (
                        <div
                          key={record.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <span className="text-xs font-medium text-slate-500 w-14">
                            {new Date(record.followup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${record.result === 'success' ? 'bg-green-500' : record.result === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{(record as any).customer_name || '未知客户'}</p>
                            <p className="text-xs text-slate-500 truncate">{record.content}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-slate-50 rounded-xl p-4 h-full">
                  <h4 className="text-sm font-medium text-slate-700 mb-4">回访详情</h4>
                  <div className="space-y-4">
                    {filteredRecords
                      .filter(r => {
                        const followupDate = new Date(r.followup_time);
                        return followupDate.toDateString() === today.toDateString();
                      })
                      .map(record => (
                        <div
                          key={record.id}
                          className="bg-white rounded-xl p-4 border-l-4 border-indigo-500 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                record.result === 'success' ? 'bg-green-100' :
                                record.result === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                              }`}>
                                <User className={`w-5 h-5 ${
                                  record.result === 'success' ? 'text-green-600' :
                                  record.result === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                }`} />
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-800">{(record as any).customer_name || '未知客户'}</h5>
                                <p className="text-sm text-slate-500">回访记录</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-indigo-600">
                              {new Date(record.followup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{record.content}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className={`px-2 py-1 rounded-lg ${getResultColor(record.result)}`}>
                              {getResultText(record.result)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">新建回访记录</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择客户 *</label>
                <select
                  value={createForm.customer_id}
                  onChange={(e) => { setCreateForm({ ...createForm, customer_id: e.target.value }); setFormErrors(prev => ({ ...prev, customer_id: '' })); }}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    formErrors.customer_id ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  )}
                >
                  <option value="">请选择客户</option>
                  {customerOptions.map(customer => (
                    <option key={customer.id} value={customer.id.toString()}>{customer.name}</option>
                  ))}
                </select>
                {formErrors.customer_id && <p className="mt-1 text-xs text-red-500">{formErrors.customer_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">回访时间 *</label>
                <input
                  type="datetime-local"
                  value={createForm.followup_time}
                  onChange={(e) => { setCreateForm({ ...createForm, followup_time: e.target.value }); setFormErrors(prev => ({ ...prev, followup_time: '' })); }}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    formErrors.followup_time ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  )}
                />
                {formErrors.followup_time && <p className="mt-1 text-xs text-red-500">{formErrors.followup_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">回访内容 *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => { setCreateForm({ ...createForm, content: e.target.value }); setFormErrors(prev => ({ ...prev, content: '' })); }}
                  rows={4}
                  className={cn(
                    'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none',
                    formErrors.content ? 'border-red-500 bg-red-50' : 'border-slate-200'
                  )}
                  placeholder="请输入回访内容..."
                />
                {formErrors.content && <p className="mt-1 text-xs text-red-500">{formErrors.content}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">回访结果</label>
                  <select
                    value={createForm.result}
                    onChange={(e) => setCreateForm({ ...createForm, result: e.target.value as FollowupResult })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="pending">待跟进</option>
                    <option value="success">成功</option>
                    <option value="failed">失败</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">下次回访时间</label>
                  <input
                    type="datetime-local"
                    value={createForm.next_followup_time}
                    onChange={(e) => setCreateForm({ ...createForm, next_followup_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex flex-col gap-3">
              {formErrors.submit && <p className="text-xs text-red-500 text-center">{formErrors.submit}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateFollowup}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">回访详情</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedRecord.result === 'success' ? 'bg-green-100 text-green-600' :
                  selectedRecord.result === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {selectedRecord.result === 'success' ? <Check className="w-6 h-6" /> :
                   selectedRecord.result === 'failed' ? <X className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">{(selectedRecord as any).customer_name || '未知客户'}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getResultColor(selectedRecord.result)}`}>
                    {getResultText(selectedRecord.result)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">回访内容</label>
                <p className="text-slate-800 whitespace-pre-wrap">{selectedRecord.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">回访时间</label>
                  <p className="text-slate-700">{new Date(selectedRecord.followup_time).toLocaleString()}</p>
                </div>
                {selectedRecord.next_followup_time && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">下次回访时间</label>
                    <p className="text-slate-700">{new Date(selectedRecord.next_followup_time).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">创建时间</label>
                <p className="text-sm text-slate-500">{new Date(selectedRecord.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}