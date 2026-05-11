// src/api/cart.api.js
import api from './index'

export const getCart = () => api.get('/cart')
export const addToCart = (data) => api.post('/cart/items', data)
export const updateCart = (productId, quantity) =>
    api.patch('/cart/items', { productId, quantity })
export const removeFromCart = (productId) =>
    api.delete(`/cart/items/${productId}`)
export const clearCart = () => api.delete('/cart')
export const validateCart = () => api.get('/cart/validate')