import { useState } from 'react'
import { Layout } from '../components/Layout'
import { Shield, Check, X, Edit2, Save, Users, Settings, Package, ShoppingCart, BookOpen, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../hooks/useAuthStore'
import { cn } from '../lib/utils'

interface Permission {
  id: string
  name: string
  icon: React.ElementType
}

const permissions: Permission[] = [
  { id: 'dashboard', name: '仪表盘', icon: Settings },
  { id: 'customers', name: '客户管理', icon: Users },
  { id: 'orders', name: '订单管理', icon: ShoppingCart },
  { id: 'products', name: '商品管理', icon: Package },
  { id: 'knowledge', name: '知识库', icon: BookOpen },
  { id: 'permissions', name: '权限管理', icon: Shield },
  { id: 'profile', name: '个人中心', icon: User },
  { id: 'settings', name: '系统设置', icon: Settings },
  { id: 'procurement', name: '采购', icon: Package }
]

const roles = [
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '拥有系统全部权限',
    permissions: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'permissions', 'profile', 'settings', 'procurement'],
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'admin',
    name: '管理员',
    description: '管理订单审核等核心功能',
    permissions: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'profile', 'settings'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'warehouse_admin',
    name: '仓库管理员',
    description: '管理库存和采购相关功能',
    permissions: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'profile', 'settings', 'procurement'],
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'member',
    name: '普通成员',
    description: '基础功能访问权限',
    permissions: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'profile'],
    color: 'from-blue-500 to-cyan-500'
  }
]

export function PermissionManagement() {
  const { user } = useAuthStore()
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {}
    roles.forEach(role => {
      initial[role.id] = [...role.permissions]
    })
    return initial
  })

  if (user?.role !== 'super_admin') {
    return (
      <Layout title="权限管理">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">权限不足</h2>
            <p className="text-slate-500 max-w-md">
              权限管理功能仅对超级管理员开放，请联系超级管理员获取相应权限。
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  const togglePermission = (roleId: string, permissionId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleId]: prev[roleId].includes(permissionId)
        ? prev[roleId].filter(p => p !== permissionId)
        : [...prev[roleId], permissionId]
    }))
  }

  const handleSave = (roleId: string) => {
    setEditingRole(null)
  }

  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions[roleId]?.includes(permissionId) ?? false
  }

  return (
    <Layout title="权限管理">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">角色权限配置</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map(role => {
              const Icon = Shield
              return (
                <div key={role.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className={`p-4 bg-gradient-to-r ${role.color} text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{role.name}</h3>
                        <p className="text-sm text-white/80">{role.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      {permissions.map(permission => {
                        const PermissionIcon = permission.icon
                        return (
                          <div
                            key={permission.id}
                            className={cn(
                              'flex items-center justify-between p-2 rounded-lg transition-colors',
                              editingRole === role.id ? 'cursor-pointer' : 'cursor-default',
                              hasPermission(role.id, permission.id) ? 'bg-indigo-50' : 'bg-slate-50'
                            )}
                            onClick={() => editingRole === role.id && togglePermission(role.id, permission.id)}
                          >
                            <div className="flex items-center gap-2">
                              <PermissionIcon className={`w-4 h-4 ${
                                hasPermission(role.id, permission.id) ? 'text-indigo-600' : 'text-slate-400'
                              }`} />
                              <span className={`text-sm ${
                                hasPermission(role.id, permission.id) ? 'text-slate-800' : 'text-slate-500'
                              }`}>
                                {permission.name}
                              </span>
                            </div>
                            {hasPermission(role.id, permission.id) ? (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                                <X className="w-3 h-3 text-slate-400" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {editingRole === role.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(role.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all"
                        >
                          <Save className="w-4 h-4" />
                          保存
                        </button>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="px-4 py-2 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRole(role.id)}
                        className="w-full flex items-center justify-center gap-1 px-4 py-2 text-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑权限
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}