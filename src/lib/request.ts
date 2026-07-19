import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'crm_access_token';
const USER_KEY = 'crm_user';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const isAuthLogin = config.url?.includes('/auth/login');
    if (token && config.headers && !isAuthLogin) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse;
    if (data.code === 200) {
      return data.data;
    }
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data, config } = error.response;
      const isAuthLogin = config?.url?.includes('/auth/login');

      if (status === 401 && !isAuthLogin) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }

      const message = data?.message || `请求失败 (${status})`;
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('网络异常，请稍后重试'));
  }
);

type RequestConfig = Omit<InternalAxiosRequestConfig, 'headers'> & { headers?: InternalAxiosRequestConfig['headers'] };

const request = axiosInstance as Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete'> & {
  get<T = any>(url: string, config?: RequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>;
};

export { request, TOKEN_KEY, USER_KEY };