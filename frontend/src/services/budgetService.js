import api from './api';

export const budgetService = {
  create: (data) => api.post('/budgets', data),
  list: () => api.get('/budgets'),
  current: () => api.get('/budgets/current'),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  remove: (id) => api.delete(`/budgets/${id}`),
};
