// src/store/slices/serviceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as serviceApi from '../../api/service.api'

export const fetchServiceCategories = createAsyncThunk('service/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const res = await serviceApi.getServiceCategories()
        if (!res.success) return rejectWithValue(res.message)
        return res.data
    } catch (err) { return rejectWithValue(err.message) }
})

export const fetchProviders = createAsyncThunk('service/fetchProviders',
    async ({ martId, categorySlug, subcategorySlug }, { rejectWithValue }) => {
        try {
            const res = await serviceApi.getProviders(martId, categorySlug, subcategorySlug)
            if (!res.success) return rejectWithValue(res.message)
            return res.data
        } catch (err) { return rejectWithValue(err.message) }
    }
)

export const fetchProviderById = createAsyncThunk('service/fetchProvider', async (id, { rejectWithValue }) => {
    try {
        const res = await serviceApi.getProviderById(id)
        if (!res.success) return rejectWithValue(res.message)
        return res.data
    } catch (err) { return rejectWithValue(err.message) }
})

export const fetchMyBookings = createAsyncThunk('service/fetchBookings', async (status, { rejectWithValue }) => {
    try {
        const res = await serviceApi.getMyBookings(status)
        if (!res.success) return rejectWithValue(res.message)
        return res.data
    } catch (err) { return rejectWithValue(err.message) }
})

export const bookService = createAsyncThunk('service/book', async (data, { rejectWithValue }) => {
    try {
        const res = await serviceApi.bookService(data)
        if (!res.success) return rejectWithValue(res.message)
        return res.data
    } catch (err) { return rejectWithValue(err.message || 'Booking failed') }
})

const serviceSlice = createSlice({
    name: 'service',
    initialState: {
        categories: [],
        providers: [],
        selected: null,
        bookings: [],
        loading: false,
        booking: false,
        error: null,
    },
    reducers: {
        clearSelected: (s) => { s.selected = null },
    },
    extraReducers: (b) => {
        b
            .addCase(fetchServiceCategories.fulfilled, (s, a) => { s.categories = a.payload || [] })
            .addCase(fetchProviders.pending, (s) => { s.loading = true })
            .addCase(fetchProviders.fulfilled, (s, a) => { s.loading = false; s.providers = a.payload?.providers || [] })
            .addCase(fetchProviders.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(fetchProviderById.fulfilled, (s, a) => { s.selected = a.payload })
            .addCase(fetchMyBookings.fulfilled, (s, a) => { s.bookings = a.payload || [] })
            .addCase(bookService.pending, (s) => { s.booking = true; s.error = null })
            .addCase(bookService.fulfilled, (s) => { s.booking = false })
            .addCase(bookService.rejected, (s, a) => { s.booking = false; s.error = a.payload })
    },
})

export const selectServiceCategories = (s) => s.service.categories
export const selectProviders = (s) => s.service.providers
export const selectSelectedProvider = (s) => s.service.selected
export const selectMyBookings = (s) => s.service.bookings
export const selectServiceLoading = (s) => s.service.loading
export const selectBooking = (s) => s.service.booking

export const { clearSelected } = serviceSlice.actions
export default serviceSlice.reducer