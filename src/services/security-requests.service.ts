import api from './api';

export interface SecurityRegistrationRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  location: any | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
}

export const securityRequestsService = {
  async createRequest(payload: { email: string; location?: any }): Promise<SecurityRegistrationRequest> {
    const response = await api.post('/security-requests', payload);
    return response.data.request;
  },

  async getStatus(email: string): Promise<{ status: 'none' | 'pending' | 'approved' | 'rejected'; request?: SecurityRegistrationRequest }> {
    const response = await api.get('/security-requests/status', { params: { email } });
    return response.data;
  },

  async adminList(status?: string): Promise<SecurityRegistrationRequest[]> {
    const response = await api.get('/admin/security-requests', { params: status ? { status } : undefined });
    return response.data.requests || [];
  },

  async adminApprove(id: string): Promise<SecurityRegistrationRequest> {
    const response = await api.patch(`/admin/security-requests/${id}/approve`);
    return response.data.request;
  },
};
