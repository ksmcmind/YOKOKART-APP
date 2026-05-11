// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sendOtp as sendOtpApi, verifyOtp as verifyOtpApi } from '../../api/auth.api'
import { setToken, setUser, getToken, getUser, getMartId, setMartId } from '../../utils/storage'

export const initAuth = createAsyncThunk('auth/init', async () => {
    try {
        const [token, user, martId] = await Promise.all([
            getToken(),
            getUser(),
            getMartId(),
        ])
        return { token: token || null, user: user || null, martId: martId || null }
    } catch (e) {
        return { token: null, user: null, martId: null }
    }
})

export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (phone, { rejectWithValue }) => {
        try {
            const res = await sendOtpApi(phone)
            const data = res.data          // axios wraps response in .data
            if (!data.success) return rejectWithValue(data.message)
            return data.data
        } catch (err) { return rejectWithValue(err.response?.data?.message || err.message || 'Failed to send OTP') }
    }
)

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ phone, otp, pushToken }, { getState, rejectWithValue }) => {
        try {
            const res = await verifyOtpApi(phone, otp, pushToken)
            const data = res.data          // axios wraps response in .data
            if (!data.success) return rejectWithValue(data.message)
            await setToken(data.data.token)
            await setUser(data.data.user)
            const martId = getState().auth.martId
            if (martId) {
                await setMartId(martId)
            }
            return data.data
        } catch (err) { return rejectWithValue(err.response?.data?.message || err.message || 'Invalid OTP') }
    }
)

export const logout = createAsyncThunk('auth/logout', async () => {
    await storage.clear()
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        martId: null,
        otpSent: false,
        loading: false,
        initialized: false,
        error: null,
    },
    reducers: {
        clearError: (s) => { s.error = null },
        setMartId: (s, a) => { s.martId = a.payload },
        updateUser: (s, a) => { s.user = { ...s.user, ...a.payload } },
    },
    extraReducers: (b) => {
        b
            .addCase(initAuth.fulfilled, (s, a) => {
                s.token = a.payload.token
                s.user = a.payload.user
                s.martId = a.payload.martId
                s.initialized = true
            })
            .addCase(sendOtp.pending, (s) => { s.loading = true; s.error = null })
            .addCase(sendOtp.fulfilled, (s) => { s.loading = false; s.otpSent = true })
            .addCase(sendOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(verifyOtp.pending, (s) => { s.loading = true; s.error = null })
            .addCase(verifyOtp.fulfilled, (s, a) => {
                s.loading = false
                s.token = a.payload.token
                s.user = a.payload.user
            })
            .addCase(verifyOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(logout.fulfilled, (s) => {
                s.user = null; s.token = null; s.martId = null; s.otpSent = false
            })
    },
})

export const selectUser = (s) => s.auth.user
export const selectToken = (s) => s.auth.token
export const selectMartId = (s) => s.auth.martId
export const selectOtpSent = (s) => s.auth.otpSent
export const selectAuthLoading = (s) => s.auth.loading
export const selectAuthError = (s) => s.auth.error
export const selectIsLoggedIn = (s) => !!s.auth.token
export const selectInitialized = (s) => s.auth.initialized

export const { clearError, setMartId: setMartIdAction, updateUser } = authSlice.actions
export default authSlice.reducer