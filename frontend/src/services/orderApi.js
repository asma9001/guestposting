import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderApi = {
  // Buyer actions
  placeOrder: (data) => API.post('/orders', data),
  getBuyerOrders: (params) => API.get('/orders', { params }),
  completeOrder: (orderId) => API.patch(`/orders/${orderId}/complete`),
  cancelOrder: (orderId, reason) => API.patch(`/orders/${orderId}/cancel`, { reason }),
  requestRevision: (orderId, note) => API.patch(`/orders/${orderId}/request-revision`, { note }),
  
  // Publisher actions
  getPublisherOrders: (params) => API.get('/orders/publisher/inbox', { params }),
  acceptOrder: (orderId) => API.patch(`/orders/${orderId}/accept`),
  rejectOrder: (orderId, reason) => API.patch(`/orders/${orderId}/reject`, { reason }),
  markAsPublished: (orderId, publishedUrl) => API.patch(`/orders/${orderId}/mark-published`, { publishedUrl }),
  
  // Shared
  getOrderById: (orderId) => API.get(`/orders/${orderId}`),
  getOrderStats: () => API.get('/orders/stats'),
};

export default API;