import api from './api';

export const transactionService = {
  list: (params = {}) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  receipt: (id) => api.get(`/transactions/${id}/receipt`),
  monthlySummary: () => api.get('/transactions/summary/monthly'),
};
