import api from './api';

export const walletService = {
  get: () => api.get('/wallet'),
  summary: () => api.get('/wallet/summary'),
  deposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  transfer: (data) => api.post('/wallet/transfer', data),
};
