import { request } from '../lib/request';
import type { User, UserRole } from '../hooks/useAuthStore';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
    role: UserRole;
    avatar: string;
  };
}

export const authApi = {
  login: (data: LoginParams) => {
    return request.post<LoginResult>('/auth/login', data);
  },
  getProfile: () => {
    return request.get<User>('/auth/profile');
  },
};