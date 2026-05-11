// src/api/service.api.js
import api from './index'

export const getServiceCategories = () =>
    api.get('/services/categories')

export const getProviders = (martId, categorySlug, subcategorySlug) => {
    let url = `/services/providers?martId=${martId}&categorySlug=${categorySlug}`
    if (subcategorySlug) url += `&subcategorySlug=${subcategorySlug}`
    return api.get(url)
}

export const getProviderById = (id) =>
    api.get(`/services/providers/${id}`)

export const getAvailableSlots = (providerId, date) =>
    api.get(`/services/providers/${providerId}/slots?date=${date}`)

export const bookService = (data) =>
    api.post('/services/bookings', data)

export const getMyBookings = (status) => {
    let url = '/services/bookings'
    if (status) url += `?status=${status}`
    return api.get(url)
}

export const cancelBooking = (id, reason) =>
    api.post(`/services/bookings/${id}/cancel`, { reason })

export const addReview = (providerId, data) =>
    api.post(`/services/providers/${providerId}/review`, data)