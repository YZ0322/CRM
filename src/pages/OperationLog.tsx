import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Search, Filter, Clock, User, FileText, ArrowRight, ChevronRight, Loader2, Eye, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { request } from '../lib/request';
import { cn } from '../lib/utils';

type OperationType = 'create' | 'update' | 'delete' | 'read' | 'login' | 'logout' | 'approve' | 'reject' | 'ship' | 'backup';

interface OperationLog {
  id: number;
  user_id: number;
  username: string;
  operation: OperationType;
  module: string;
  description: string;
  params: string;
  result: string;
  ip: string;
  user_agent: string;
  status: number;
  created_at: string;
}

const operationLabels: Record<OperationType, string> = {
  create: '新增',
  update: '修改',
  delete: '删除',
  read: '查看',
  login: '登录',
  logout: '退出',
  approve: '审核通过',
  reject: '审核拒绝',
  ship: '发货',
  backup: '备份',
};

const operationColors: Record<OperationType, string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  delete: 'bg-red-500',
  read: 'bg-slate-500',
  login: 'bg-indigo-500',
  logout: 'bg-slate-400',
  approve: 'bg-emerald-500',
  reject: 'bg-orange-500',
  ship: 'bg-purple-500',
  backup: 'bg-amber-500',
};

const operationBgColors: Record<OperationType, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  read: 'bg-slate-100 text-slate-700',
  login: 'bg-indigo-100 text-indigo-700',
  logout: 'bg-slate-100 text-slate-700',
  approve: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-orange-100 text-orange-700',
  ship: 'bg-purple-100 text-purple-700',
  backup: 'bg-amber-100 text-amber-700',
};

const modules = ['全部', '客户管理', '订单管理', '商品管理', '公告管理', '系统设置', '权限管理'];

export function OperationLogPage() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('全部');
  const [selectedOperation, setSelectedOperation] = useState<OperationType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [stats, setStats] = useState<{ todayCount: number; successRate: number; topUsers: { username: string; count: number }[]; operationDistribution: { type: OperationType; count: number }[]; moduleDistribution: { module: string; count: number }[]; dailyTrend: { date: string; count: number }[] } | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const result = await request.get('/operation-logs', {
        params: {
          page,
          pageSize: 10,
          operation: selectedOperation !== 'all' ? selectedOperation : undefined,
          module: selectedModule !== '全部' ? selectedModule : undefined,
          username: searchTerm || undefined,
        },
      });
      setLogs(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('获取操作日志失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await request.get('/operation-logs', {
        params: { page: 1, pageSize: 1000 },
      });
      
      const allLogs = result.data || [];
      const todayLogs = allLogs.filter((log: OperationLog) => log.created_at?.startsWith(today));
      const successLogs = allLogs.filter((log: OperationLog) => log.status === 1);
      
      const userCounts: Record<string, number> = {};
      const opCounts: Record<string, number> = {};
      const moduleCounts: Record<string, number> = {};
      const dayCounts: Record<string, number> = {};
      
      allLogs.forEach((log: OperationLog) => {
        userCounts[log.username || '匿名'] = (userCounts[log.username || '匿名'] || 0) + 1;
        opCounts[log.operation] = (opCounts[log.operation] || 0) + 1;
        moduleCounts[log.module] = (moduleCounts[log.module] || 0) + 1;
        
        const date = log.created_at?.split(' ')[0] || '';
        dayCounts[date] = (dayCounts[date] || 0) + 1;
      });
      
      const topUsers = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([username, count]) => ({ username, count }));
      
      const operationDistribution = Object.entries(opCounts)
        .map(([type, count]) => ({ type: type as OperationType, count }))
        .sort((a, b) => b.count - a.count);
      
      const moduleDistribution = Object.entries(moduleCounts)
        .map(([module, count]) => ({ module, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      
      const dailyTrend = Object.entries(dayCounts)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .slice(-7)
        .map(([date, count]) => ({ date, count }));
      
      setStats({
        todayCount: todayLogs.length,
        successRate: allLogs.length > 0 ? Math.round((successLogs.length / allLogs.length) * 100) : 0,
        topUsers,
        operationDistribution,
        moduleDistribution,
        dailyTrend,
      });
    } catch (err) {
      console.error('获取统计数据失败:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, selectedModule, selectedOperation, searchTerm]);

  const handleViewDetail = (log: OperationLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  const parseJson = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  const totalPages = Math.ceil(total / 10);
  const maxOperationCount = stats?.operationDistribution.reduce((max, item) => Math.max(max, item.count), 0) || 1;
  const maxModuleCount = stats?.moduleDistribution.reduce((max, item) => Math.max(max, item.count), 0) || 1;
  const maxDailyCount = stats?.dailyTrend.reduce((max, item) => Math.max(max, item.count), 0) || 1;

  return (
    <Layout title="操作日志">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">总操作数</p>
                <p className="text-2xl font-bold text-slate-800">{total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">今日操作</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.todayCount || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">成功率</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.successRate || 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">活跃用户</p>
                <p className="text-2xl font-bold text-slate-800">{stats?.topUsers.length || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">近7天操作趋势</h2>
            </div>
            <div className="h-48 flex items-end gap-4">
              {stats?.dailyTrend.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                    style={{ height: maxDailyCount > 0 ? `${(item.count / maxDailyCount) * 100}%` : '0%', minHeight: '4px' }}
                    title={`${item.date}: ${item.count}次`}
                  />
                  <span className="text-xs text-slate-500">{item.date.split('-').slice(1).join('/')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">操作类型分布</h2>
            </div>
            <div className="space-y-3">
              {stats?.operationDistribution.slice(0, 5).map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{operationLabels[item.type]}</span>
                    <span className="text-sm font-medium text-slate-800">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${operationColors[item.type]} rounded-full transition-all duration-500`}
                      style={{ width: maxOperationCount > 0 ? `${(item.count / maxOperationCount) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">活跃用户排行</h2>
            </div>
            <div className="space-y-3">
              {stats?.topUsers.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-slate-100 text-slate-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.username}</p>
                  </div>
                  <span className="text-sm text-slate-500">{item.count} 次操作</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">模块操作分布</h2>
            </div>
            <div className="space-y-3">
              {stats?.moduleDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{item.module}</span>
                    <span className="text-sm font-medium text-slate-800">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: maxModuleCount > 0 ? `${(item.count / maxModuleCount) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg">
                管理员可见
              </div>
              <span className="text-slate-500">操作日志列表</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                {total}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索用户名..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-8 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {modules.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={selectedOperation}
                  onChange={(e) => {
                    setSelectedOperation(e.target.value as OperationType | 'all');
                    setPage(1);
                  }}
                  className="pl-3 pr-8 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  <option value="all">全部操作</option>
                  {(Object.keys(operationLabels) as OperationType[]).map(op => (
                    <option key={op} value={op}>{operationLabels[op]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">时间</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">操作人</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">模块</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">描述</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">IP</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无操作日志</p>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {log.created_at}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-800">{log.username || '匿名'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">{log.module}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${operationBgColors[log.operation]}`}>
                          {operationLabels[log.operation]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 max-w-xs truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">{log.ip || '-'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          log.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status === 1 ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleViewDetail(log)}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          <Eye className="w-3 h-3" />
                          详情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 10 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                显示 {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} 条，共 {total} 条
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-lg',
                        page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">操作日志详情</h3>
                  <span className="text-sm text-slate-500">ID: {selectedLog.id}</span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-500 rotate-90" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">操作人</p>
                  <p className="font-medium text-slate-800">{selectedLog.username || '匿名'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">操作类型</p>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${operationBgColors[selectedLog.operation]}`}>
                    {operationLabels[selectedLog.operation]}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">所属模块</p>
                  <p className="font-medium text-slate-800">{selectedLog.module}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">操作时间</p>
                  <p className="font-medium text-slate-800">{selectedLog.created_at}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">IP地址</p>
                  <p className="font-medium text-slate-800">{selectedLog.ip || '-'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">状态</p>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    selectedLog.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedLog.status === 1 ? '成功' : '失败'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 mb-2">操作描述</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">{selectedLog.description}</p>
              </div>

              {selectedLog.params && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">请求参数</h4>
                  <pre className="text-xs text-slate-600 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
                    {parseJson(selectedLog.params)}
                  </pre>
                </div>
              )}

              {selectedLog.result && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">执行结果</h4>
                  <pre className="text-xs text-slate-600 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
                    {parseJson(selectedLog.result)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}