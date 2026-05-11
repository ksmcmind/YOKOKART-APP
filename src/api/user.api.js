// src/api/user.api.js
import api from './index'

export const getProfile = () => api.get('/users/me')
export const updateProfile = (data) => api.patch('/users/me', data)
export const getAddresses = () => api.get('/users/addresses')
export const addAddress = (data) => api.post('/users/addresses', data)
export const updateAddress = (id, data) => api.patch(`/users/addresses/${id}`, data)
export const deleteAddress = (id) => api.delete(`/users/addresses/${id}`)
export const setDefaultAddr = (id) => api.patch(`/users/addresses/${id}/default`)
export const updatePushToken = (token) => api.patch('/users/push-token', { pushToken: token })
export const updateLocation = (lat, lng) => api.patch('/users/me/location', { lat, lng })