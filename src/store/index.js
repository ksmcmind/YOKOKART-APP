// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import productReducer from './slices/productSlice'
import serviceReducer from './slices/serviceSlice'
import uiReducer from './slices/uiSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
        product: productReducer,
        service: serviceReducer,
        ui: uiReducer,
    },
})

export default store