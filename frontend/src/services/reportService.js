import api from './api';

export const reportService = {
  userDashboard: () => api.get('/reports/user-dashboard'),
  incomeExpense: () => api.get('/reports/income-expense'),
  budgetUsage: () => api.get('/reports/budget-usage'),
};
