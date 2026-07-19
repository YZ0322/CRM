import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Search, Edit2, Eye, Plus, Save, X, Trash2, ShoppingBag, ChevronLeft, AlertCircle, Check } from 'lucide-react';
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

export function StockManagement() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [products, stocks] = await Promise.all([
        productApi.getList({ pageSize: 100 }),
        stockApi.getList({ pageSize: 100 }),
      ]);
      setProductsList(products.data);
      setStockList(stocks.data);
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = productsList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockQuantity = (productId: number) => {
    const stock = stockList.find(s => s.product_id === productId);
    return stock?.quantity || 0;
  };

  const getStockId = (productId: number) => {
    const stock = stockList.find(s => s.product_id === productId);
    return stock?.id || null;
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || '未知';

  return (
    <Layout title="商品库存">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <div className={`px-3 py-1 text-sm font-medium rounded-lg ${
                canEdit ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {canEdit ? '编辑模式' : '只读模式'}
              </div>
            </div>
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">商品信息</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">价格</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">库存数量</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">库存状态</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无库存数据</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const stock = getStockQuantity(product.id);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {product.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{product.name}</p>
                              <p className="text-sm text-slate-500">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{getCategoryName(product.category_id)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-800">¥{Number(product.price).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'font-semibold text-lg',
                            stock < 10 ? 'text-red-500' :
                            stock < 50 ? 'text-yellow-500' : 'text-green-600'
                          )}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            stock < 10 ? 'bg-red-100 text-red-700' :
                            stock < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          )}>
                            {stock < 10 ? '库存紧张' :
                             stock < 50 ? '库存偏低' : '库存充足'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {canEdit ? (
                            <button
                              onClick={() => navigate(`/stock-details/${product.id}`)}
                              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              <Eye className="w-4 h-4" />
                              查看详情
                            </button>
                          ) : (
                            <button className="flex items-center gap-1 text-sm text-slate-500">
                              <Eye className="w-4 h-4" />
                              查看
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function StockDetails() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [stock, setStock] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    const id = Number(productId);
    
    const fetchData = async () => {
      if (isNaN(id) || id <= 0) return;
      
      setLoading(true);
      try {
        const [productData, stocks] = await Promise.all([
          productApi.getDetail(id),
          stockApi.getList({ productId: id }),
        ]);
        setProduct(productData);
        const stockData = stocks.data.find(s => s.product_id === id);
        setStock(stockData);
        setEditQuantity(stockData?.quantity || 0);
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleSave = async () => {
    if (!stock) return;
    
    try {
      await stockApi.update(stock.id, { quantity: editQuantity });
      setSaveSuccess(true);
      setShowConfirmModal(false);
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('保存库存失败:', err);
    }
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || '未知';

  if (loading) {
    return (
      <Layout title="库存详情">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="库存详情">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">商品不存在</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`库存详情 - ${product.name}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/stock')} className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            返回库存列表
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                  {product.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{product.name}</h2>
                  <p className="text-sm text-slate-500">{product.sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">分类</p>
                  <p className="font-medium text-slate-800">{getCategoryName(product.category_id)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">价格</p>
                  <p className="font-medium text-slate-800">¥{Number(product.price).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">成本价</p>
                  <p className="font-medium text-slate-800">¥{Number(product.cost_price).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">状态</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {product.status === 'active' ? '在售' : '下架'}
                  </span>
                </div>
              </div>

              {product.description && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">商品描述</h3>
                  <p className="text-slate-700">{product.description}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-800">库存信息</h2>
                </div>
                {saveSuccess && (
                  <span className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    保存成功
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">当前库存数量</label>
                  <div className="flex items-center gap-4">
                    {canEdit ? (
                      <>
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                          min={0}
                          className="w-48 px-4 py-3 text-lg border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <button
                          onClick={() => setShowConfirmModal(true)}
                          className="flex items-center gap-2 px-6 py-3 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all shadow-md shadow-indigo-500/20"
                        >
                          <Save className="w-4 h-4" />
                          保存修改
                        </button>
                      </>
                    ) : (
                      <span className={cn(
                        'text-2xl font-bold',
                        editQuantity < 10 ? 'text-red-500' :
                        editQuantity < 50 ? 'text-yellow-500' : 'text-green-600'
                      )}>
                        {editQuantity}
                      </span>
                    )}
                  </div>
                </div>

                {stock && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">锁定库存</p>
                      <p className="font-medium text-slate-800">{stock.locked_quantity}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">可用库存</p>
                      <p className="font-medium text-slate-800">{stock.quantity - stock.locked_quantity}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">库存状态</p>
                  <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    editQuantity < 10 ? 'bg-red-100 text-red-700' :
                    editQuantity < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  )}>
                    {editQuantity < 10 ? '库存紧张' :
                     editQuantity < 50 ? '库存偏低' : '库存充足'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Save className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">确认保存</h3>
                  <p className="text-sm text-slate-500">修改库存后将立即生效</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">商品名称</p>
                <p className="font-medium text-slate-800">{product.name}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">修改后库存</p>
                <p className={cn(
                  'text-xl font-bold',
                  editQuantity < 10 ? 'text-red-500' :
                  editQuantity < 50 ? 'text-yellow-500' : 'text-green-600'
                )}>
                  {editQuantity} 件
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  确认保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}