
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  auth: {
    login: (data: { email: string; password: string }) => 
      api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
  },
  meetings: {
    list: () => api.get('/meetings'),
    create: (data: any) => api.post('/meetings', data),
    update: (id: number, data: any) => api.put(`/meetings/${id}`, data),
    delete: (id: number) => api.delete(`/meetings/${id}`),
  },
  availability: {
    get: (userId: number) => api.get(`/availability/${userId}`),
    update: (userId: number, data: any) => api.put(`/availability/${userId}`, data),
  },
};

export default apiClient;
