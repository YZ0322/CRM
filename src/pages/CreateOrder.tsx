import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { User, Search, Plus, Minus, Trash2, Package, ShoppingCart, Loader2, Check } from 'lucide-react';
import { customerApi, type Customer } from '../api/customer';
import { productApi } from '../api/product';
import { orderApi } from '../api/order';
import { useAuthStore } from '../hooks/useAuthStore';

interface CartItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  category_id: number;
  status: string;
}

export function CreateOrder() {
  const { user } = useAuthStore();
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customerResult, productResult] = await Promise.all([
          customerApi.getList({ pageSize: 100 }),
          productApi.getList({ pageSize: 100 }),
        ]);
        setCustomers(customerResult.data);
        setProducts(productResult.data);
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
      }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCustomer = () => customers.find(c => c.id === selectedCustomer);

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || cart.length === 0) return;
    
    setSubmitting(true);
    try {
      await orderApi.create({
        customer_id: selectedCustomer,
        user_id: user?.id || 1,
        total_amount: totalAmount,
        shipping_address: {
          name: getCustomer()?.name || '',
          phone: getCustomer()?.phone || '',
          address: getCustomer()?.address || '',
        },
      });
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setCart([]);
        setSelectedCustomer(null);
      }, 2000);
    } catch (err) {
      console.error('提交订单失败:', err);
      alert('提交订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="下单">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">选择客户</h2>
          </div>

          <button
            onClick={() => setShowCustomerModal(true)}
            className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left"
          >
            {selectedCustomer && getCustomer() ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{getCustomer()?.name}</p>
                  <p className="text-sm text-slate-500">{getCustomer()?.company || '无公司'} | {getCustomer()?.phone || '无电话'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <User className="w-8 h-8 mx-auto mb-2" />
                <p>点击选择客户</p>
              </div>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">选择商品</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="mt-2 text-sm text-slate-500">加载中...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">暂无商品数据</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className={`p-4 border rounded-xl hover:shadow-sm transition-all ${
                      product.status === 'active'
                        ? 'border-slate-200 hover:border-indigo-300'
                        : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-800">{product.name}</h3>
                        <p className="text-sm text-slate-400">{product.sku}</p>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">¥{Number(product.price).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        product.status === 'active' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {product.status === 'active' ? '在售' : '已下架'}
                      </span>
                      {product.status === 'active' && (
                        <button
                          onClick={() => addToCart(product)}
                          className="px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all"
                        >
                          添加
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-800">订单明细</h2>
              <span className="ml-auto text-sm text-slate-500">{cart.length} 件商品</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3" />
                <p>购物车为空</p>
                <p className="text-sm">请选择商品添加到订单</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition-colors text-indigo-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-800">¥{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500">商品总价</span>
                    <span className="font-medium">¥{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500">运费</span>
                    <span className="font-medium text-green-600">免运费</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-slate-800">实付金额</span>
                    <span className="text-xl font-bold text-indigo-600">¥{totalAmount.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={!selectedCustomer || cart.length === 0 || submitting}
                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedCustomer && cart.length > 0 && !submitting
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {orderSuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        订单提交成功
                      </>
                    ) : submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      '提交订单'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {showCustomerModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">选择客户</h3>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="搜索客户..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    暂无客户数据
                  </div>
                ) : (
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer.id);
                        setShowCustomerModal(false);
                      }}
                      className="w-full p-4 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors mb-3 last:mb-0"
                    >
                      <p className="font-medium text-slate-800">{customer.name}</p>
                      <p className="text-sm text-slate-500">
                        {customer.company || '无公司'} | {customer.phone || '无电话'}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}