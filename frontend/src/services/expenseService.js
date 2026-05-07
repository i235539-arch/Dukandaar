import api from './api';

export const expenseService = {
  create: (data) => api.post('/expenses', data),
  list: (params = {}) => api.get('/expenses', { params }),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
  monthlySummary: () => api.get('/expenses/summary/monthly'),
  categorySummary: () => api.get('/expenses/summary/categories'),
};
