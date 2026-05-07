import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      // Drop token on 401 anywhere except the login page itself
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('dd_token');
        localStorage.removeItem('dd_user');
        // Soft redirect to login
        if (path.startsWith('/app') || path.startsWith('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const apiError = (err) => {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong'
  );
};

export const apiErrorList = (err) => {
  const errors = err?.response?.data?.errors;
  if (Array.isArray(errors)) return errors;
  return null;
};
