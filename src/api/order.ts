import { request } from '../lib/request';

export const orderApi = {
  getList: (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) =>
    request.get('/orders', { params }),
  getDetail: (id: number) => request.get(`/orders/${id}`),
  create: (data: { customer_id: number; user_id: number; total_amount: number; shipping_address: Record<string, string>; remark?: string }) =>
    request.post('/orders', data),
  approve: (id: number, userId: number) => request.put(`/orders/${id}/approve`, { user_id: userId }),
  reject: (id: number) => request.put(`/orders/${id}/reject`),
  ship: (id: number, userId: number, shippingCompany?: string, trackingNumber?: string) => request.put(`/orders/${id}/ship`, { user_id: userId, shipping_company: shippingCompany, tracking_number: trackingNumber }),
  complete: (id: number) => request.put(`/orders/${id}/complete`),
  processRefund: (id: number) => request.put(`/orders/${id}/refund`),
  confirmReturn: (id: number) => request.put(`/orders/${id}/return`),
  cancel: (id: number) => request.put(`/orders/${id}/cancel`),
  updateTracking: (id: number, trackingNumber: string, shippingCompany: string) => request.put(`/orders/${id}/tracking`, { tracking_number: trackingNumber, shipping_company: shippingCompany }),
};