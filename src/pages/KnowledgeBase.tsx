import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { FileText, Folder, Search, Clock, User, ChevronRight, BookOpen, AlertCircle, Info, X, ExternalLink, HelpCircle, Plus, Save, Edit, Trash2, Send } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { announcementApi, Announcement, AnnouncementType } from '../api/announcement';

const documents = [
  { id: 1, title: '产品使用手册', category: '产品文档', author: '张三', updateTime: '2024-01-15', views: 234, type: 'pdf', content: '本手册详细介绍了系统的各项功能和操作方法。\n\n## 系统概述\n\nCRM系统是一款专为企业客户关系管理设计的软件，提供客户管理、订单管理、商品管理等核心功能。\n\n## 主要功能\n\n1. **客户管理**：支持客户信息录入、编辑、查询和删除\n2. **订单管理**：订单创建、审核、发货、退款全流程管理\n3. **商品管理**：商品信息维护和库存管理\n4. **数据分析**：销售数据统计和报表分析\n\n## 使用提示\n\n请确保您已获得相应的操作权限，如有问题请联系管理员。' },
  { id: 2, title: 'API接口文档', category: '技术文档', author: '李四', updateTime: '2024-01-14', views: 156, type: 'doc', content: '本文档提供系统API接口的详细说明。\n\n## 基础信息\n\n- 基础URL: http://api.example.com\n- 认证方式: JWT Token\n- 数据格式: JSON\n\n## 接口列表\n\n### 认证接口\n- POST /auth/login - 用户登录\n- POST /auth/register - 用户注册\n\n### 客户接口\n- GET /customers - 获取客户列表\n- POST /customers - 创建客户\n- GET /customers/:id - 获取客户详情\n\n## 错误码\n\n- 400: 请求参数错误\n- 401: 未授权\n- 403: 权限不足\n- 500: 服务器错误' },
  { id: 3, title: '常见问题解答', category: '帮助文档', author: '王五', updateTime: '2024-01-13', views: 456, type: 'md', content: '## 常见问题\n\n### 1. 忘记密码怎么办？\n\n请点击登录页面的"忘记密码"链接，按照提示操作重置密码。\n\n### 2. 如何添加客户？\n\n在客户管理页面点击"添加客户"按钮，填写客户信息后保存即可。\n\n### 3. 订单审核需要多久？\n\n通常订单审核会在24小时内完成，紧急订单可联系管理员优先处理。\n\n### 4. 如何查看库存？\n\n在商品管理页面点击"库存调整"可查看当前库存数量。\n\n### 5. 数据如何导出？\n\n各模块列表页面均提供导出按钮，支持Excel格式导出。' },
  { id: 4, title: '系统升级说明', category: '公告', author: '赵六', updateTime: '2024-01-12', views: 128, type: 'txt', content: '系统升级说明\n\n版本: v1.0.1\n\n更新内容:\n\n1. 修复客户搜索功能问题\n2. 优化订单列表加载速度\n3. 添加商品库存管理功能\n4. 改进数据导出功能\n5. 修复若干已知Bug\n\n升级时间:\n2024年1月15日 00:00 - 02:00\n\n注意事项:\n- 升级期间系统将暂停服务\n- 请提前做好数据备份\n- 升级完成后请清理浏览器缓存' },
  { id: 5, title: '操作指南', category: '帮助文档', author: '钱七', updateTime: '2024-01-11', views: 312, type: 'pdf', content: '操作指南\n\n## 快速入门\n\n### 登录系统\n\n1. 打开浏览器访问系统地址\n2. 输入用户名和密码\n3. 点击登录按钮\n\n### 首页概览\n\n登录后进入首页，可查看:\n- 今日待办事项\n- 数据统计概览\n- 最近动态\n\n### 客户管理\n\n1. 点击左侧菜单"客户管理"\n2. 查看客户列表\n3. 点击客户名称查看详情\n4. 点击"添加客户"创建新客户\n\n### 订单管理\n\n1. 点击左侧菜单"订单管理"\n2. 查看订单列表\n3. 根据状态筛选订单\n4. 执行审核、发货等操作' },
  { id: 6, title: '数据安全规范', category: '技术文档', author: '孙八', updateTime: '2024-01-10', views: 89, type: 'doc', content: '数据安全规范\n\n## 概述\n\n本规范旨在保障系统数据的安全性和完整性。\n\n## 访问控制\n\n1. 最小权限原则：用户仅能访问完成工作所需的最小权限\n2. 定期审查：定期审查用户权限，及时回收不需要的权限\n3. 权限变更：权限变更需经过审批流程\n\n## 数据保护\n\n1. 数据加密：敏感数据传输和存储时进行加密\n2. 备份策略：定期进行数据备份\n3. 访问日志：记录关键操作日志\n\n## 应急处理\n\n1. 发现安全问题立即上报\n2. 按照应急预案处理\n3. 事后进行安全审计' }
];

const categories = ['全部', '产品文档', '技术文档', '帮助文档', '公告'];

export function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return { color: 'text-red-500', bg: 'bg-red-100' };
      case 'doc': return { color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'md': return { color: 'text-indigo-500', bg: 'bg-indigo-100' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  const handleViewDoc = (doc: typeof documents[0]) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  return (
    <Layout title="文档中心">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索文档标题或作者..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => handleViewDoc(doc)}
                className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${getFileIcon(doc.type).bg} flex items-center justify-center`}>
                    <FileText className={`w-5 h-5 ${getFileIcon(doc.type).color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{doc.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {doc.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {doc.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.updateTime}
                    </span>
                  </div>
                  <span className="text-slate-400">{doc.views} 次浏览</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Folder className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">文档分类</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: '产品文档', count: 12, icon: 'pdf' },
              { name: '技术文档', count: 8, icon: 'doc' },
              { name: '帮助文档', count: 15, icon: 'md' },
              { name: '公告', count: 5, icon: 'txt' }
            ].map((cat, index) => (
              <div
                key={index}
                onClick={() => setSelectedCategory(cat.name)}
                className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getFileIcon(cat.icon).bg} flex items-center justify-center`}>
                    <BookOpen className={`w-5 h-5 ${getFileIcon(cat.icon).color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{cat.name}</p>
                    <p className="text-sm text-slate-500">{cat.count} 篇文档</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${getFileIcon(selectedDoc.type).bg} flex items-center justify-center`}>
                  <FileText className={`w-5 h-5 ${getFileIcon(selectedDoc.type).color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{selectedDoc.title}</h3>
                  <span className="text-sm text-slate-500">{selectedDoc.category}</span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="flex items-center gap-6 mb-6 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedDoc.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedDoc.updateTime}
                </span>
                <span>{selectedDoc.views} 次浏览</span>
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                {selectedDoc.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export function InformationBoard() {
  const { user } = useAuthStore();
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    type: 'info' as AnnouncementType,
  });

  const canManage = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await announcementApi.getList();
      setAnnouncements(result);
    } catch (err) {
      console.error('获取公告失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'warning': return { icon: AlertCircle, bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700' };
      case 'info': return { icon: Info, bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700' };
      case 'danger': return { icon: AlertCircle, bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700' };
      case 'success': return { icon: AlertCircle, bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700' };
      default: return { icon: Info, bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700' };
    }
  };

  const handleLinkClick = (name: string) => {
    setActiveLink(name);
    setTimeout(() => setActiveLink(null), 500);
    alert(`${name} 功能即将上线，敬请期待！`);
  };

  const handleCreateAnnouncement = async () => {
    if (!createForm.title || !createForm.content) {
      alert('请填写完整的公告信息');
      return;
    }
    try {
      await announcementApi.create({
        title: createForm.title,
        content: createForm.content,
        type: createForm.type,
        created_by: user?.id || 1,
      });
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', type: 'info' });
      fetchAnnouncements();
    } catch (err) {
      console.error('创建公告失败:', err);
      alert('创建公告失败');
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setCreateForm({ title: announcement.title, content: announcement.content, type: announcement.type });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAnnouncement || !createForm.title || !createForm.content) {
      alert('请填写完整的公告信息');
      return;
    }
    try {
      await announcementApi.update(editingAnnouncement.id, {
        title: createForm.title,
        content: createForm.content,
        type: createForm.type,
        updated_by: user?.id || 1,
      });
      setShowEditModal(false);
      setEditingAnnouncement(null);
      setCreateForm({ title: '', content: '', type: 'info' });
      fetchAnnouncements();
    } catch (err) {
      console.error('更新公告失败:', err);
      alert('更新公告失败');
    }
  };

  const handlePublish = async (id: number) => {
    if (!confirm('确定要发布这个公告吗？')) return;
    try {
      await announcementApi.publish(id, user?.id || 1);
      fetchAnnouncements();
    } catch (err) {
      console.error('发布公告失败:', err);
      alert('发布公告失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个公告吗？')) return;
    try {
      await announcementApi.delete(id);
      fetchAnnouncements();
    } catch (err) {
      console.error('删除公告失败:', err);
      alert('删除公告失败');
    }
  };

  const publishedAnnouncements = announcements.filter(a => a.status === 'published');

  return (
    <Layout title="信息看板">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">系统公告</h2>
              {canManage && (
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  新建公告
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : publishedAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无系统公告</p>
              </div>
            ) : (
              publishedAnnouncements.map(item => {
                const style = getTypeStyle(item.type);
                const Icon = style.icon;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${style.border} ${style.bg} hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${style.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-slate-800">{item.title}</h3>
                          <span className="text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600">{item.content}</p>
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditAnnouncement(item)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {canManage && announcements.filter(a => a.status === 'draft').length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-slate-700 mb-4">草稿箱</h3>
                {announcements.filter(a => a.status === 'draft').map(item => {
                  const style = getTypeStyle(item.type);
                  const Icon = style.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border ${style.border} ${style.bg} opacity-75`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${style.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-slate-800">{item.title}</h3>
                            <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full">草稿</span>
                          </div>
                          <p className="text-sm text-slate-600">{item.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditAnnouncement(item)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button onClick={() => handlePublish(item.id)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                            <Send className="w-4 h-4 text-green-600" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">快捷链接</h3>
              <div className="space-y-3">
                {[
                  { name: '帮助中心', href: '#' },
                  { name: '在线客服', href: '#' },
                  { name: '反馈建议', href: '#' },
                  { name: '版本更新', href: '#' },
                  { name: 'API文档', href: '#' }
                ].map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(link.name)}
                    className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
                      activeLink === link.name ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">需要帮助？</h3>
              </div>
              <p className="text-indigo-100 text-sm mb-4">我们的支持团队随时为您服务</p>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
              >
                联系客服
              </button>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">联系客服</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <h4 className="font-medium text-slate-800 mb-2">在线客服支持</h4>
                <p className="text-sm text-slate-500">工作时间：周一至周五 9:00-18:00</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">QQ</span>
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">客服QQ</p>
                    <p className="font-medium text-slate-800">123456789</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">微信</span>
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">客服微信</p>
                    <p className="font-medium text-slate-800">CRM_Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">电话</span>
                  </span>
                  <div>
                    <p className="text-sm text-slate-500">客服热线</p>
                    <p className="font-medium text-slate-800">400-888-8888</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">新建公告</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公告标题 *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入公告标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公告类型</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as AnnouncementType })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="info">信息</option>
                  <option value="warning">警告</option>
                  <option value="success">成功</option>
                  <option value="danger">危险</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公告内容 *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  placeholder="请输入公告内容..."
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateAnnouncement}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                保存草稿
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">编辑公告</h3>
              <button onClick={() => { setShowEditModal(false); setEditingAnnouncement(null); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公告标题 *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入公告标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公告类型</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as AnnouncementType })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="info">信息</option>
                  <option value="warning">警告</option>
                  <option value="success">成功</option>
                  <option value="danger">危险</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">公告内容 *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  placeholder="请输入公告内容..."
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${editingAnnouncement?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {editingAnnouncement?.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => { setShowEditModal(false); setEditingAnnouncement(null); }}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              {editingAnnouncement?.status === 'draft' ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    保存草稿
                  </button>
                  <button
                    onClick={() => { handleSaveEdit(); handlePublish(editingAnnouncement.id); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    保存并发布
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存修改
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}