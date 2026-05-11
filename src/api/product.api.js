// src/api/product.api.js
import api from './index'

export const getNearestMart = (lat, lng) =>
    api.get(`/marts/nearest?lat=${lat}&lng=${lng}`)

export const getHome = (martId) =>
    api.get(`/home?martId=${martId}`)

export const getCategories = (martId) =>
    api.get(`/catalog/marts/${martId}/categories`)

export const getProducts = (martId, params) =>
    api.get(`/catalog/marts/${martId}/products`, { params: { ...params, inStockOnly: true } })

export const getProductById = (martId, productId) =>
    api.get(`/catalog/marts/${martId}/products/${productId}`)

export const searchProducts = (martId, query) =>
    api.get(`/catalog/marts/${martId}/search?q=${query}`)

export const getSuggestions = (martId, query) =>
    api.get(`/catalog/marts/${martId}/suggest?q=${query}`)