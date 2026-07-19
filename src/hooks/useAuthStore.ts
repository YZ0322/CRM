import { create } from 'zustand'
import { authApi } from '../api/auth'
import { TOKEN_KEY, USER_KEY } from '../lib/request'

export type UserRole = 'super_admin' | 'admin' | 'warehouse_admin' | 'member'

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  hasPermission: (permission: string) => boolean
  canAccessMenu: (menuKey: string) => boolean
}

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'permissions', 'profile', 'settings', 'procurement'],
  admin: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'profile', 'settings'],
  warehouse_admin: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'profile', 'settings', 'procurement'],
  member: ['dashboard', 'customers', 'orders', 'products', 'knowledge', 'profile']
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
  loading: false,

  login: async (username: string, password: string) => {
    set({ loading: true })
    try {
      const result = await authApi.login({ username, password })
      localStorage.setItem(TOKEN_KEY, result.access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      set({ user: result.user, isAuthenticated: true, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  hasPermission: (permission: string) => {
    const { user } = get()
    if (!user) return false
    const permissions = rolePermissions[user.role]
    return permissions.includes(permission)
  },

  canAccessMenu: (menuKey: string) => {
    return get().hasPermission(menuKey)
  }
}))
