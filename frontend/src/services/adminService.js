import api from './api';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  listUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  blockUser: (id, reason) => api.patch(`/admin/users/${id}/block`, { reason }),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
  listWallets: () => api.get('/admin/wallets'),
  listAllTransactions: (params = {}) => api.get('/admin/transactions', { params }),
  flagged: () => api.get('/admin/transactions/flagged'),
  transactionVolume: () => api.get('/admin/reports/transaction-volume'),
  systemBalance: () => api.get('/admin/reports/system-balance'),
  auditLogs: () => api.get('/admin/audit-logs'),
};
