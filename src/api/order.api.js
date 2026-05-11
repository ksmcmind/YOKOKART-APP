import api from './index'

export const getOrders = (params) => 
    api.get('/orders', { params })

export const getOrderById = (id) => 
    api.get(`/orders/${id}`)

export const createOrder = (data) => 
    api.post('/orders', data)

export const cancelOrder = (id, reason) => 
    api.post(`/orders/${id}/cancel`, { reason })

export const getActiveOrder = () => 
    api.get('/orders/active')

export const getOrderTransactions = (id) => 
    api.get(`/orders/${id}/transactions`)

export const reorder = (orderId) => 
    api.post(`/orders/${orderId}/reorder`)

export const createRazorpayOrder = (amount) =>
    api.post('/payments/razorpay/order', { amount })

export const verifyPayment = (data) =>
    api.post('/payments/razorpay/verify', data)