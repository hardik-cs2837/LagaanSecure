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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const listings = {
  getListings: (filters) => api.get('/listings', { params: filters }),
  createListing: (data) => api.post('/listings', data),
  getListing: (id) => api.get(`/listings/${id}`),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getDemandSupplyAnalytics: () => api.get('/listings/analytics/demand-supply'),
  getStorageOptions: (state) => api.get('/listings/storage-options', { params: { state } }),
  getLogisticsOptions: (params) => api.get('/listings/logistics-options', { params }),
  getRouteSuggestions: (params) => api.get('/listings/route-suggestions', { params }),
};

export const prices = {
  getPrice: (commodity, state, market) =>
    api.get(`/prices/${encodeURIComponent(commodity)}`, { params: { state, market } }),
  getTrends: (commodity, state) =>
    api.get(`/prices/${encodeURIComponent(commodity)}/trends`, { params: { state } }),
  getAvailableCommodities: () => api.get('/prices'),
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
};

export const notifications = {
  getNotifications: (userId) => api.get(`/notifications/${userId}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const advisor = {
  getAdvice: (data) => api.post('/advisor/explain', data),
};

export default api;
