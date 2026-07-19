import { request } from '../lib/request';

export const productApi = {
  getList: (params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) =>
    request.get('/products', { params }),
  getDetail: (id: number) => request.get(`/products/${id}`),
  create: (data: { name: string; sku: string; category_id: number; price: number; cost_price: number; description?: string; images?: string[]; status?: string; created_by: number }) =>
    request.post('/products', data),
  update: (id: number, data: { name?: string; sku?: string; category_id?: number; price?: number; cost_price?: number; description?: string; images?: string[]; status?: string }) =>
    request.put(`/products/${id}`, data),
  delete: (id: number) => request.delete(`/products/${id}`),
};

export const stockApi = {
  getList: (params: { page?: number; pageSize?: number; productId?: number } = {}) =>
    request.get('/stock', { params }),
  getDetail: (id: number) => request.get(`/stock/${id}`),
  update: (id: number, data: { quantity?: number; locked_quantity?: number }) =>
    request.put(`/stock/${id}`, data),
  adjust: (productId: number, delta: number) => request.put(`/stock/product/${productId}/adjust`, { delta }),
};