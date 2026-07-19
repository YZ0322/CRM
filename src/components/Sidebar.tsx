import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  ShoppingCart,
  Package,
  BookOpen,
  FileSearch,
  Shield,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckSquare
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuthStore, UserRole } from '../hooks/useAuthStore'

interface MenuItem {
  key: string
  label: string
  icon: React.ElementType
  path?: string
  badge?: string
  badgeType?: 'admin' | 'readonly'
  children?: MenuItem[]
  requiredRoles?: UserRole[]
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    key: 'customers',
    label: '客户管理',
    icon: Users,
    children: [
      { key: 'customer-list', label: '客户列表', icon: FileText, path: '/customers' },
      { key: 'follow-up', label: '客户回访', icon: Calendar, path: '/follow-up' }
    ]
  },
  {
    key: 'orders',
    label: '订单管理',
    icon: ShoppingCart,
    children: [
      { key: 'create-order', label: '下单', icon: Package, path: '/create-order' },
      {
        key: 'order-approval',
        label: '订单审核',
        icon: CheckSquare,
        path: '/order-approval',
        badge: '管理员/超管可见',
        badgeType: 'admin',
        requiredRoles: ['super_admin', 'admin']
      },
      { key: 'order-list', label: '订单列表', icon: FileText, path: '/orders' },
      { key: 'unshipped', label: '未发货', icon: Package, path: '/orders/unshipped' },
      { key: 'shipped', label: '已发货', icon: Truck, path: '/orders/shipped' },
      { key: 'refund', label: '仅退款', icon: FileText, path: '/orders/refund' },
      { key: 'return', label: '退货退款', icon: FileText, path: '/orders/return' },
      { key: 'data-summary', label: '数据汇总', icon: FileText, path: '/orders/summary' }
    ]
  },
  {
    key: 'products',
    label: '商品管理',
    icon: Package,
    children: [
      {
        key: 'product-info',
        label: '商品信息',
        icon: FileText,
        path: '/products'
      },
      {
        key: 'stock-management',
        label: '商品库存',
        icon: Package,
        path: '/stock'
      }
    ]
  },
  {
    key: 'knowledge',
    label: '知识库',
    icon: BookOpen,
    children: [
      { key: 'documents', label: '文档中心', icon: FileText, path: '/documents' },
      { key: 'information', label: '信息看板', icon: FileSearch, path: '/information' }
    ]
  },
  {
    key: 'permissions',
    label: '权限管理',
    icon: Shield,
    path: '/permissions',
    requiredRoles: ['super_admin']
  },
  {
    key: 'profile',
    label: '个人中心',
    icon: User,
    path: '/profile'
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: Settings,
    children: [
      { key: 'settings-main', label: '系统管理', icon: Settings, path: '/settings' },
      {
        key: 'operation-logs',
        label: '操作日志',
        icon: FileText,
        path: '/operation-logs',
        badge: '管理员/超管可见',
        badgeType: 'admin',
        requiredRoles: ['super_admin', 'admin']
      }
    ]
  },
  {
    key: 'procurement',
    label: '采购',
    icon: Truck,
    path: '/procurement',
    requiredRoles: ['warehouse_admin', 'super_admin', 'admin']
  }
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['customers', 'orders', 'products', 'knowledge', 'settings'])
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuKey) ? prev.filter(key => key !== menuKey) : [...prev, menuKey]
    )
  }

  const isMenuExpanded = (menuKey: string) => expandedMenus.includes(menuKey)

  const isActive = (path?: string) => {
    if (!path) return false
    if (path.includes('/details/')) {
      return location.pathname.startsWith('/order-details')
    }
    return location.pathname === path
  }

  const canViewItem = (item: MenuItem) => {
    if (!item.requiredRoles) return true
    if (!user) return false
    return item.requiredRoles.includes(user.role)
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!canViewItem(item)) return null

    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = hasChildren && isMenuExpanded(item.key)
    const active = isActive(item.path) || (hasChildren && item.children.some(child => isActive(child.path)))

    return (
      <div key={item.key}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.key)
            } else if (item.path) {
              navigate(item.path)
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
            'hover:bg-slate-700/50 dark:hover:bg-slate-800/50 hover:text-white',
            active && 'bg-indigo-600/20 text-indigo-400',
            !active && 'text-slate-300 dark:text-slate-400',
            level > 0 && 'pl-8',
            collapsed && 'justify-center'
          )}
        >
          <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-indigo-400')} />
          {!collapsed && (
            <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
          )}
          {!collapsed && hasChildren && (
            isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )
          )}
          {!collapsed && item.badge && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              item.badgeType === 'admin' && 'bg-red-500/20 text-red-400',
              item.badgeType === 'readonly' && 'bg-slate-500/30 text-slate-400'
            )}>
              {item.badge}
            </span>
          )}
        </button>
        {!collapsed && hasChildren && isExpanded && (
          <div className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-slate-800 dark:bg-slate-900 border-r border-slate-700 dark:border-slate-800',
      'transition-all duration-300 ease-in-out z-40',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        <div className={cn(
          'h-16 flex items-center justify-between px-4 border-b border-slate-700 dark:border-slate-800',
          collapsed && 'justify-center'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold text-lg">CRM</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </div>
        </nav>
        
        {!collapsed && user && (
          <div className="p-4 border-t border-slate-700 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user.username}</p>
                <p className="text-slate-400 text-xs truncate">
                  {user.role === 'super_admin' && '超级管理员'}
                  {user.role === 'admin' && '管理员'}
                  {user.role === 'warehouse_admin' && '仓库管理员'}
                  {user.role === 'member' && '普通成员'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}