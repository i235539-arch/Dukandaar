import api from './api';

export const propertyService = {
  list: (params = {}) => api.get('/properties', { params }),
  get: (id) => api.get(`/properties/${id}`),
  invest: (id, data) => api.post(`/properties/${id}/invest`, data),
  myInvestments: () => api.get('/properties/me/investments'),
  // Admin
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  remove: (id) => api.delete(`/properties/${id}`),
  verify: (id) => api.patch(`/properties/${id}/verify`),
  payDividend: (id, data) => api.post(`/properties/${id}/pay-dividend`, data),
};
