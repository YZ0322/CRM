import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from './hooks/useAuthStore'
import {
  Login,
  Dashboard,
  CustomerList,
  CustomerDetails,
  FollowUp,
  CreateOrder,
  OrderApproval,
  OrderDetails,
  OrderList,
  UnshippedOrders,
  ShippedOrders,
  RefundOrders,
  ReturnOrders,
  OrderSummary,
  ProductInfo,
  StockManagement,
  StockDetails,
  Documents,
  InformationBoard,
  PermissionManagement,
  Profile,
  Settings,
  Procurement,
  OperationLogPage
} from './pages'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function PermissionRoute({ children, requireRole }: { children: React.ReactNode; requireRole: string[] }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  if (!requireRole.includes(user.role)) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-xl text-slate-600">暂无权限访问此页面</p>
        <p className="text-sm text-slate-400 mt-2">请联系管理员获取权限</p>
      </div>
    </div>
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/customers" element={
          <PrivateRoute>
            <CustomerList />
          </PrivateRoute>
        } />
        <Route path="/customer-details/:id" element={
          <PrivateRoute>
            <CustomerDetails />
          </PrivateRoute>
        } />
        <Route path="/follow-up" element={
          <PrivateRoute>
            <FollowUp />
          </PrivateRoute>
        } />
        <Route path="/create-order" element={
          <PrivateRoute>
            <CreateOrder />
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <OrderList />
          </PrivateRoute>
        } />
        <Route path="/order-approval" element={
          <PrivateRoute>
            <PermissionRoute requireRole={['super_admin', 'admin']}>
              <OrderApproval />
            </PermissionRoute>
          </PrivateRoute>
        } />
        <Route path="/order-details/:id" element={
          <PrivateRoute>
            <OrderDetails />
          </PrivateRoute>
        } />
        <Route path="/orders/unshipped" element={
          <PrivateRoute>
            <UnshippedOrders />
          </PrivateRoute>
        } />
        <Route path="/orders/shipped" element={
          <PrivateRoute>
            <ShippedOrders />
          </PrivateRoute>
        } />
        <Route path="/orders/refund" element={
          <PrivateRoute>
            <RefundOrders />
          </PrivateRoute>
        } />
        <Route path="/orders/return" element={
          <PrivateRoute>
            <ReturnOrders />
          </PrivateRoute>
        } />
        <Route path="/orders/summary" element={
          <PrivateRoute>
            <OrderSummary />
          </PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute>
            <ProductInfo />
          </PrivateRoute>
        } />
        <Route path="/stock" element={
          <PrivateRoute>
            <StockManagement />
          </PrivateRoute>
        } />
        <Route path="/stock-details/:productId" element={
          <PrivateRoute>
            <StockDetails />
          </PrivateRoute>
        } />
        <Route path="/documents" element={
          <PrivateRoute>
            <Documents />
          </PrivateRoute>
        } />
        <Route path="/information" element={
          <PrivateRoute>
            <InformationBoard />
          </PrivateRoute>
        } />
        <Route path="/permissions" element={
          <PrivateRoute>
            <PermissionRoute requireRole={['super_admin']}>
              <PermissionManagement />
            </PermissionRoute>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/operation-logs" element={
          <PrivateRoute>
            <PermissionRoute requireRole={['super_admin', 'admin']}>
              <OperationLogPage />
            </PermissionRoute>
          </PrivateRoute>
        } />
        <Route path="/procurement" element={
          <PrivateRoute>
            <PermissionRoute requireRole={['super_admin', 'admin', 'warehouse_admin']}>
              <Procurement />
            </PermissionRoute>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}