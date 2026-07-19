import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Package, Search, Edit2, Eye, Plus, Save, X, Trash2, ShoppingBag, Minus, Plus as PlusIcon } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { cn } from '../lib/utils';
import { productApi, stockApi } from '../api/product';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  category_id: number;
  description?: string;
  images?: string[];
  status: string;
  created_at: string;
}

interface StockItem {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  locked_quantity: number;
}

const categories = [
  { id: 1, name: '电子产品' },
  { id: 2, name: '办公用品' },
  { id: 3, name: '数码配件' },
  { id: 4, name: '服装鞋帽' },
  { id: 5, name: '食品饮料' },
  { id: 6, name: '家居用品' },
  { id: 7, name: '美妆护肤' },
  { id: 8, name: '母婴用品' },
  { id: 9, name: '运动户外' },
  { id: 10, name: '图书音像' },
  { id: 11, name: '汽车用品' },
  { id: 12, name: '家用电器' },
  { id: 13, name: '医药保健' },
  { id: 14, name: '宠物用品' },
  { id: 15, name: '珠宝首饰' },
];

export function ProductInfo() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    category_id: 1,
    price: 0,
    cost_price: 0,
    description: '',
    status: 'active',
  });

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: currentPage, pageSize: 10 };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== '全部') params.status = statusFilter;
      const result: any = await productApi.getList(params);
      setProductsList(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('获取商品列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, statusFilter]);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditData({ ...product });
  };

  const handleSave = async () => {
    if (!editData) return;
    try {
      await productApi.update(editData.id, editData);
      setEditingId(null);
      setEditData(null);
      fetchProducts();
    } catch (err) {
      console.error('更新商品失败:', err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该商品吗？')) return;
    try {
      await productApi.delete(id);
      fetchProducts();
    } catch (err) {
      console.error('删除商品失败:', err);
    }
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.sku || addForm.price <= 0) {
      alert('请填写完整信息');
      return;
    }
    try {
      await productApi.create({ ...addForm, created_by: user?.id || 1 });
      setShowAddModal(false);
      setAddForm({ name: '', sku: '', category_id: 1, price: 0, cost_price: 0, description: '', status: 'active' });
      fetchProducts();
    } catch (err) {
      console.error('添加商品失败:', err);
    }
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || '未知';

  return (
    <Layout title="商品信息">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 text-sm font-medium rounded-lg ${
                canEdit ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {canEdit ? '编辑模式' : '只读模式'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索商品名称或SKU..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="全部">全部状态</option>
                <option value="active">在售</option>
                <option value="inactive">下架</option>
              </select>
              {canEdit && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4" />
                  添加商品
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : productsList.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无商品数据</p>
              </div>
            ) : (
              productsList.map(product => (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border transition-all ${
                    editingId === product.id ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {editingId === product.id && editData ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <input
                        type="text"
                        value={editData.sku}
                        onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <select
                        value={editData.category_id}
                        onChange={(e) => setEditData({ ...editData, category_id: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
                        >
                          <Save className="w-4 h-4" />
                          保存
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center justify-center gap-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-800">{product.name}</h3>
                          <p className="text-sm text-slate-500">{product.sku}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {product.status === 'active' ? '在售' : '下架'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">价格</span>
                          <span className="font-medium text-indigo-600">¥{Number(product.price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">成本价</span>
                          <span className="text-slate-600">¥{Number(product.cost_price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">分类</span>
                          <span className="text-slate-700">{getCategoryName(product.category_id)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {canEdit ? (
                          <>
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                            查看
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {total > 10 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-slate-500">第 {currentPage} 页 / 共 {Math.ceil(total / 10)} 页</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(total / 10), p + 1))}
                disabled={currentPage >= Math.ceil(total / 10)}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">添加商品</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">商品名称</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入商品名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={addForm.sku}
                  onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入SKU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                <select
                  value={addForm.category_id}
                  onChange={(e) => setAddForm({ ...addForm, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">销售价格</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">成本价</label>
                  <input
                    type="number"
                    value={addForm.cost_price}
                    onChange={(e) => setAddForm({ ...addForm, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="active">在售</option>
                  <option value="inactive">下架</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  rows={3}
                  placeholder="请输入商品描述"
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
                onClick={handleAdd}
                className="flex-1 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

