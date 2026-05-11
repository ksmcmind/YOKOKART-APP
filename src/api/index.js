import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'http://192.168.101.3:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { getToken } from '../utils/storage';

api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error retrieving token:', err);
  }
  return config;
}, (error) => Promise.reject(error));

export const catalogApi = {
  getHome: (martId) => api.get(`/home?martId=${martId}`),
  getCategories: (martId) => api.get(`/catalog/marts/${martId}/categories`),
  getProducts: (martId, params) => api.get(`/catalog/marts/${martId}/products`, { params }),
  getSuggestions: (martId, q) => api.get(`/catalog/marts/${martId}/suggest`, { params: { q } }),
  search: (martId, params) => api.get(`/catalog/marts/${martId}/search`, { params }),
  getProduct: (martId, productId) => api.get(`/catalog/marts/${martId}/products/${productId}`),
  getBrands: (martId, params) => api.get(`/catalog/marts/${martId}/brands`, { params }),
  getProductsByBrand: (martId, brand, params) => api.get(`/catalog/marts/${martId}/brands/${brand}/products`, { params }),
};

export const martApi = {
  getNearest: (lat, lng) => api.get('/marts/nearest', { params: { lat, lng } }),
  getDefault: (city) => api.get('/marts/default', { params: { city } }),
};

export default api;