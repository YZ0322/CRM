import { useState } from 'react'
import { Layout } from '../components/Layout'
import { Package, ShoppingCart, Search, Filter, Plus, Edit2, Trash2, Check, Clock, X, FileText } from 'lucide-react'
import { cn } from '../lib/utils'

interface ProcurementItem {
  id: string
  productName: string
  supplier: string
  quantity: number
  unit: string
  price: number
  status: 'pending' | 'approved' | 'ordered' | 'received'
  createTime: string
  category: string
}

const mockData: ProcurementItem[] = [
  { id: 'PR001', productName: '无线蓝牙耳机', supplier: '深圳电子科技', quantity: 50, unit: '个', price: 89, status: 'pending', createTime: '2024-01-15', category: '电子产品' },
  { id: 'PR002', productName: 'USB-C数据线', supplier: '东莞线缆厂', quantity: 100, unit: '条', price: 15, status: 'approved', createTime: '2024-01-14', category: '配件' },
  { id: 'PR003', productName: '笔记本电脑支架', supplier: '宁波五金制品', quantity: 30, unit: '个', price: 68, status: 'ordered', createTime: '2024-01-13', category: '外设' },
  { id: 'PR004', productName: '机械键盘', supplier: '常州电子厂', quantity: 20, unit: '个', price: 299, status: 'received', createTime: '2024-01-12', category: '外设' },
  { id: 'PR005', productName: '无线鼠标', supplier: '深圳电子科技', quantity: 80, unit: '个', price: 45, status: 'pending', createTime: '2024-01-15', category: '外设' }
]

const categories = ['全部', '电子产品', '配件', '外设', '其他']
const statuses = ['全部', '待审批', '已审批', '已下单', '已收货']

export function Procurement() {
  const [procurementList, setProcurementList] = useState<ProcurementItem[]>(mockData)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedStatus, setSelectedStatus] = useState('全部')
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<ProcurementItem | null>(null)
  const [formData, setFormData] = useState({
    productName: '',
    supplier: '',
    quantity: 0,
    unit: '个',
    price: 0,
    category: '电子产品'
  })

  const filteredList = procurementList.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory
    const statusMap: Record<string, string[]> = {
      '全部': ['pending', 'approved', 'ordered', 'received'],
      '待审批': ['pending'],
      '已审批': ['approved'],
      '已下单': ['ordered'],
      '已收货': ['received']
    }
    const matchesStatus = statusMap[selectedStatus].includes(item.status)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: '待审批', color: 'bg-yellow-100 text-yellow-700' }
      case 'approved': return { label: '已审批', color: 'bg-blue-100 text-blue-700' }
      case 'ordered': return { label: '已下单', color: 'bg-indigo-100 text-indigo-700' }
      case 'received': return { label: '已收货', color: 'bg-green-100 text-green-700' }
      default: return { label: status, color: 'bg-slate-100 text-slate-700' }
    }
  }

  const handleSubmit = () => {
    if (isEditing && editingItem) {
      setProcurementList(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newItem: ProcurementItem = {
        id: `PR${String(procurementList.length + 1).padStart(3, '0')}`,
        ...formData,
        status: 'pending',
        createTime: new Date().toISOString().split('T')[0]
      }
      setProcurementList(prev => [newItem, ...prev])
    }
    setShowModal(false)
    setIsEditing(false)
    setEditingItem(null)
    setFormData({ productName: '', supplier: '', quantity: 0, unit: '个', price: 0, category: '电子产品' })
  }

  const handleEdit = (item: ProcurementItem) => {
    setEditingItem(item)
    setIsEditing(true)
    setFormData({
      productName: item.productName,
      supplier: item.supplier,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      category: item.category
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setProcurementList(prev => prev.filter(item => item.id !== id))
  }

  const handleStatusChange = (id: string, newStatus: 'pending' | 'approved' | 'ordered' | 'received') => {
    setProcurementList(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ))
  }

  const totals = {
    pending: procurementList.filter(i => i.status === 'pending').length,
    approved: procurementList.filter(i => i.status === 'approved').length,
    ordered: procurementList.filter(i => i.status === 'ordered').length,
    received: procurementList.filter(i => i.status === 'received').length
  }

  return (
    <Layout title="采购管理">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">待审批</p>
              <p className="text-2xl font-bold mt-1">{totals.pending}</p>
            </div>
            <Clock className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">已审批</p>
              <p className="text-2xl font-bold mt-1">{totals.approved}</p>
            </div>
            <Check className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">已下单</p>
              <p className="text-2xl font-bold mt-1">{totals.ordered}</p>
            </div>
            <ShoppingCart className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">已收货</p>
              <p className="text-2xl font-bold mt-1">{totals.received}</p>
            </div>
            <Package className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索商品名称或供应商..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              新建采购单
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">采购单号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">商品名称</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">供应商</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">类别</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">数量/单位</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">单价</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">状态</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">创建时间</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-800">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.supplier}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">¥{item.price}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(item.status).color}`}>
                      {getStatusInfo(item.status).label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{item.createTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {item.status !== 'received' && (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                          className="text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="pending">待审批</option>
                          <option value="approved">已审批</option>
                          <option value="ordered">已下单</option>
                          <option value="received">已收货</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无采购记录</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{isEditing ? '编辑采购单' : '新建采购单'}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setIsEditing(false)
                  setEditingItem(null)
                  setFormData({ productName: '', supplier: '', quantity: 0, unit: '个', price: 0, category: '电子产品' })
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">商品名称</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">供应商</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="请输入供应商"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">类别</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {categories.filter(c => c !== '全部').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">数量</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="个"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">单价(元)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowModal(false)
                  setIsEditing(false)
                  setEditingItem(null)
                  setFormData({ productName: '', supplier: '', quantity: 0, unit: '个', price: 0, category: '电子产品' })
                }}
                className="flex-1 px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
              >
                {isEditing ? '保存修改' : '创建采购单'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}