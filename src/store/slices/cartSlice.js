// src/store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as cartApi from '../../api/cart.api'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
    try {
        const res = await cartApi.getCart()
        const data = res.data
        if (!data.success) return rejectWithValue(data.message)
        return data.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue, dispatch }) => {
    try {
        const res = await cartApi.addToCart(data)
        const data2 = res.data
        if (!data2.success) return rejectWithValue(data2.message)
        dispatch(fetchCart())
        return data2.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue, dispatch }) => {
    try {
        if (quantity === 0) {
            await cartApi.removeFromCart(productId)
        } else {
            await cartApi.updateCart(productId, quantity)
        }
        dispatch(fetchCart())
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

export const clearCartAction = createAsyncThunk('cart/clear', async (_, { rejectWithValue, dispatch }) => {
    try {
        await cartApi.clearCart()
        dispatch(fetchCart())
    } catch (err) { return rejectWithValue(err.response?.data?.message || err.message) }
})

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        subtotal: 0,
        total: 0,
        martId: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (b) => {
        b
            .addCase(fetchCart.pending, (s) => { s.loading = true })
            .addCase(fetchCart.fulfilled, (s, a) => {
                s.loading = false
                s.items = a.payload?.items || []
                s.subtotal = a.payload?.subtotal || 0
                s.total = a.payload?.total ?? a.payload?.subtotal ?? 0
                s.martId = a.payload?.martId || null
            })
            .addCase(fetchCart.rejected, (s, a) => { s.loading = false; s.error = a.payload })
    },
})

export const selectCartItems = (s) => s.cart.items
export const selectCartTotal = (s) => s.cart.total
export const selectCartSubtotal = (s) => s.cart.subtotal
export const selectCartMartId = (s) => s.cart.martId
export const selectCartCount = (s) => s.cart.items.reduce((t, i) => t + i.quantity, 0)
export const selectCartLoading = (s) => s.cart.loading

// Get quantity of specific product in cart
export const selectProductQty = (productId) => (s) =>
    s.cart.items.find(i => (i.mongoProductId || i.productId) === productId)?.quantity || 0

export default cartSlice.reducer