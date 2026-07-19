import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { cn } from '../lib/utils'
import { Bell, Search, Menu, X } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <header className="fixed top-0 right-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className={cn(
            'h-full flex items-center justify-between px-6',
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h1>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
              
              <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>
        
        <main className={cn(
          'pt-20 pb-8 px-6 min-h-screen',
          'transition-all duration-300 ease-in-out'
        )}>
          {children}
        </main>
      </div>
      
      <div className={cn(
        'fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity',
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <div className={cn(
        'fixed left-0 top-0 h-screen w-64 bg-slate-800 dark:bg-slate-900 z-50 lg:hidden transition-transform',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold text-lg">CRM</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <Sidebar />
        </div>
      </div>
    </div>
  )
}