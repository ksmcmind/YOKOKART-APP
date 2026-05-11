// src/api/auth.api.js
import api from './index'

export const sendOtp = (phone) =>
    api.post('/auth/send-otp', { phone, userType: 'customer' })

export const verifyOtp = (phone, otp, pushToken = null) =>
    api.post('/auth/verify-otp', { phone, otp, userType: 'customer', pushToken })

export const logout = () =>
    api.post('/auth/logout')

export const uploadKycDocument = (type, base64Image) =>
    api.post('/upload/image', { image: base64Image, folder: `kyc/${type}` })

export const submitKyc = (data) =>
    api.post('/users/kyc', data)

export const getKycStatus = () =>
    api.get('/users/kyc')