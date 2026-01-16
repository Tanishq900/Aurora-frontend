import api from './api';

export interface AdminUser {
  id: 'admin';
  email: string;
  role: 'admin';
}

export interface AdminAuthResponse {
  user: AdminUser;
  accessToken: string;
}

export const adminService = {
  async login(email: string, password: string): Promise<AdminAuthResponse> {
    const response = await api.post('/admin/login', { email, password });
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },
};
