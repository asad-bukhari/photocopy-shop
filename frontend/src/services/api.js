import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8069';
const API_PREFIX = '/api/photocopy';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard')
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getPriceHistory: (id) => api.get(`/products/${id}/price-history`)
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id, reassignToCategoryId) =>
    api.delete(`/categories/${id}`, { data: { reassignToCategoryId } })
};

// Stock API
export const stockAPI = {
  quickAdjust: (id, adjustment, reason) =>
    api.patch(`/products/${id}/stock`, { adjustment, reason }),
  update: (id, stock, reason) =>
    api.put(`/products/${id}/stock`, { stock, reason })
};

// Price History API
export const priceHistoryAPI = {
  getByProduct: (productId) => api.get(`/products/${productId}/price-history`)
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  recordPayment: (id, data) => api.post(`/customers/${id}/payments`, data)
};

// Bills API
export const billsAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  delete: (id) => api.delete(`/bills/${id}`)
};

// Expenses API
export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`)
};

// Reports API
export const reportsAPI = {
  getDaily: (params) => api.get('/reports/daily', { params }),
  getSales: (params) => api.get('/reports/sales', { params }),
  getInventory: () => api.get('/reports/inventory'),
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params })
};

// Settings API
export const settingsAPI = {
  getShopSettings: () => api.get('/settings/shop'),
  updateShopSettings: (data) => api.put('/settings/shop', data),
  uploadLogo: (formData) => api.post('/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePin: (data) => api.post('/settings/change-pin', data)
};

export default api;
