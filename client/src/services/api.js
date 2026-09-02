import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const listings = {
  getListings: (filters) => api.get('/listings', { params: filters }),
  createListing: (data) => api.post('/listings', data),
  getListing: (id) => api.get(`/listings/${id}`),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getDemandSupplyAnalytics: () => api.get('/listings/analytics/demand-supply'),
  getPlatformImpactAnalytics: () => api.get('/listings/analytics/platform-impact'),
  getStorageOptions: (state) => api.get('/listings/storage-options', { params: { state } }),
  storeLot: (id, data) => api.post(`/listings/${id}/store`, data),
  getLogisticsOptions: (params) => api.get('/listings/logistics-options', { params }),
  getRouteSuggestions: (params) => api.get('/listings/route-suggestions', { params }),
  getMultiStopRoute: (data) => api.post('/listings/multi-stop-route', data),
  aggregateFpo: (data) => api.post('/listings/fpo-aggregate', data),
};

export const prices = {
  getPrice: (commodity, state, market) =>
    api.get(`/prices/${encodeURIComponent(commodity)}`, { params: { state, market } }),
  getTrends: (commodity, state) =>
    api.get(`/prices/${encodeURIComponent(commodity)}/trends`, { params: { state } }),
  getAvailableCommodities: () => api.get('/prices'),
};

export const demand = {
  getForecast: (crop) => api.get('/demand/forecast', { params: { crop } }),
  getAllForecasts: () => api.get('/demand/all'),
};

export const matching = {
  getBestBuyers: (crop, quantity, location) =>
    api.get('/matching/best-buyers', { params: { crop, quantity, location } }),
};

export const bulkRequirements = {
  getRequirements: (params) => api.get('/bulk-requirements', { params }),
  createRequirement: (data) => api.post('/bulk-requirements', data),
};

export const markupCheck = {
  checkMarkup: (listingId, enteredPrice) =>
    api.post(`/listings/${listingId}/markup-check`, { enteredPrice }),
  checkMarkupDirect: (crop, enteredPrice, state, market) =>
    api.post('/advisor/explain', { mandiPrice: null, enteredPrice, crop, state, market }),
};

export const deals = {
  createDeal: (data) => api.post('/deals', data),
  getMyDeals: () => api.get('/deals/my'),
  updateDeal: (id, data) => api.patch(`/deals/${id}`, data),
  rateDeal: (id, data) => api.post(`/deals/${id}/rate`, data),
  getReceipt: (id) => api.get(`/deals/${id}/receipt`),
};

export const notifications = {
  getNotifications: (userId) => api.get(`/notifications/${userId}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const advisor = {
  getAdvice: (data) => api.post('/advisor/explain', data),
  chat: (message, context, language) => api.post('/advisor/chat', { message, context, language }),
};

export const admin = {
  getKPIs: () => api.get('/admin/kpis'),
  getHealth: () => api.get('/admin/health'),
  getTransactions: () => api.get('/admin/transactions'),
};

export const disputes = {
  getDisputes: (params) => api.get('/disputes', { params }),
  createDispute: (data) => api.post('/disputes', data),
  updateDisputeStatus: (id, data) => api.patch(`/disputes/${id}/status`, data),
};

export default api;
