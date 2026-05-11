// src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        toast: null,
        searchQuery: '',
        selectedTab: 'home',
    },
    reducers: {
        showToast: (s, a) => { s.toast = a.payload },  // { message, type }
        hideToast: (s) => { s.toast = null },
        setSearch: (s, a) => { s.searchQuery = a.payload },
        setTab: (s, a) => { s.selectedTab = a.payload },
    },
})

export const selectToast = (s) => s.ui.toast
export const selectSearchQuery = (s) => s.ui.searchQuery
export const selectSelectedTab = (s) => s.ui.selectedTab

export const { showToast, hideToast, setSearch, setTab } = uiSlice.actions
export default uiSlice.reducer