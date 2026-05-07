import api from './api';

export const categoryService = {
  list: (type) => api.get('/categories', { params: type ? { type } : {} }),
  // Admin
  adminList: () => api.get('/admin/categories'),
  adminCreate: (data) => api.post('/admin/categories', data),
  adminUpdate: (id, data) => api.put(`/admin/categories/${id}`, data),
  adminDisable: (id) => api.patch(`/admin/categories/${id}/disable`),
};
