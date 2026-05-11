import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as orderApi from '../../api/order.api'
import { addToCart } from './cartSlice'

export const fetchOrders = createAsyncThunk('order/fetchOrders', async (_, { rejectWithValue }) => {
    try {
        const res = await orderApi.getOrders()
        const data = res.data
        if (!data.success) return rejectWithValue(data.message)
        return data.data || []
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

export const placeOrder = createAsyncThunk('order/placeOrder', async (orderData, { rejectWithValue }) => {
    try {
        const res = await orderApi.createOrder(orderData)
        const data = res.data
        if (!data.success) return rejectWithValue(data.message)
        return data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

// Reorder Logic: Adds items to cart then redirects (or handles on UI)
export const handleReorder = createAsyncThunk('order/reorder', async (order, { dispatch, rejectWithValue }) => {
    try {
        // Option 1: Call backend reorder endpoint
        const res = await orderApi.reorder(order.id)
        const data = res.data
        if (!data.success) return rejectWithValue(data.message)
        return data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

export const fetchOrderById = createAsyncThunk('order/fetchById', async (id, { rejectWithValue }) => {
    try {
        const res = await orderApi.getOrderById(id)
        const data = res.data
        if (!data.success) return rejectWithValue(data.message)
        return data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        list: [],
        current: null,
        loading: false,
        placing: false,
        error: null,
    },
    reducers: {
        setCurrentOrder: (s, a) => { s.current = a.payload },
        clearOrderError: (s) => { s.error = null }
    },
    extraReducers: (b) => {
        b
            .addCase(fetchOrders.pending, (s) => { s.loading = true; s.error = null })
            .addCase(fetchOrders.fulfilled, (s, a) => { 
                s.loading = false
                s.list = a.payload 
            })
            .addCase(fetchOrders.rejected, (s, a) => { 
                s.loading = false
                s.error = a.payload 
            })
            .addCase(placeOrder.pending, (s) => { s.placing = true; s.error = null })
            .addCase(placeOrder.fulfilled, (s, a) => {
                s.placing = false
                s.list = [a.payload, ...s.list]
            })
            .addCase(placeOrder.rejected, (s, a) => {
                s.placing = false
                s.error = a.payload
            })
            .addCase(fetchOrderById.fulfilled, (s, a) => {
                s.current = a.payload
            })
            .addCase(handleReorder.pending, (s) => { s.loading = true; s.error = null })
            .addCase(handleReorder.fulfilled, (s, a) => { s.loading = false })
            .addCase(handleReorder.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    },
})

export const { setCurrentOrder, clearOrderError } = orderSlice.actions
export const selectOrders = (s) => s.order.list
export const selectCurrentOrder = (s) => s.order.current
export const selectOrderLoading = (s) => s.order.loading
export const selectOrderPlacing = (s) => s.order.placing

export default orderSlice.reducer