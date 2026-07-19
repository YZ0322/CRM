import { request } from '../lib/request';

export type CustomerStatus = 'active' | 'inactive' | 'lost';
export type FollowupResult = 'pending' | 'success' | 'failed';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  phone_code: string;
  wechat: string;
  company: string;
  address: string;
  province: string;
  city: string;
  district: string;
  street: string;
  source: string;
  status: CustomerStatus;
  remark: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetail extends Customer {
  followups: Followup[];
}

export interface Followup {
  id: number;
  customer_id: number;
  user_id: number;
  followup_time: string;
  content: string;
  result: FollowupResult;
  next_followup_time: string | null;
  created_at: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CustomerStatus;
  source?: string;
}

export const customerApi = {
  getList: (params: CustomerListParams = {}) => {
    return request.get<CustomerListResponse>('/customers', { params });
  },
  getDetail: (id: number) => {
    return request.get<CustomerDetail>(`/customers/${id}`);
  },
  create: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    return request.post<Customer>('/customers', data);
  },
  update: (id: number, data: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) => {
    return request.put<Customer>(`/customers/${id}`, data);
  },
  delete: (id: number) => {
    return request.delete<{ id: number }>(`/customers/${id}`);
  },
  getFollowups: (customerId: number) => {
    return request.get<Followup[]>(`/customers/${customerId}/followups`);
  },
  createFollowup: (customerId: number, data: { user_id: number; followup_time: string; content: string; result?: FollowupResult; next_followup_time?: string }) => {
    return request.post<Followup>(`/customers/${customerId}/followups`, data);
  },
  updateFollowup: (followupId: number, data: { followup_time?: string; content?: string; result?: FollowupResult; next_followup_time?: string }) => {
    return request.put<Followup>(`/customers/followups/${followupId}`, data);
  },
  deleteFollowup: (followupId: number) => {
    return request.delete<{ id: number }>(`/customers/followups/${followupId}`);
  },
};