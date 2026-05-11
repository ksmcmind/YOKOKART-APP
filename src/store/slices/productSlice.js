// src/store/slices/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as productApi from '../../api/product.api'

export const fetchCategories = createAsyncThunk('product/fetchCategories', async (martId, { rejectWithValue }) => {
    try {
        const res = await productApi.getCategories(martId)
        return res.data?.data || res.data || []
    } catch (err) { return rejectWithValue(err.message) }
})

export const fetchProducts = createAsyncThunk('product/fetchProducts',
    async ({ martId, categoryId, subcategorySlug, offset = 0, limit = 20 }, { rejectWithValue }) => {
        try {
            const res = await productApi.getProducts(martId, { categoryId, subcategorySlug, offset, limit })
            const products = res.data?.data?.products || res.data?.products || res.data || []
            return { products, offset }
        } catch (err) { return rejectWithValue(err.message) }
    }
)

export const fetchProductById = createAsyncThunk('product/fetchProductById',
    async ({ martId, productId }, { rejectWithValue }) => {
        try {
            const res = await productApi.getProductById(martId, productId)
            return res.data?.data || res.data || null
        } catch (err) { return rejectWithValue(err.message) }
    }
)

export const fetchHomeSections = createAsyncThunk('product/fetchHomeSections', async (martId, { rejectWithValue }) => {
    try {
        const res = await productApi.getHome(martId)
        return res.data?.data || {}
    } catch (err) { return rejectWithValue(err.message) }
})

const productSlice = createSlice({
    name: 'product',
    initialState: {
        categories: [],
        products: [],
        sections: [],
        banners: [],
        selectedProduct: null,
        loading: false,
        hasMore: true,
        error: null,
    },
    reducers: {
        clearProducts: (s) => { s.products = []; s.hasMore = true; },
        setSelectedProduct: (s, a) => { s.selectedProduct = a.payload }
    },
    extraReducers: (b) => {
        b
            .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload })
            .addCase(fetchProducts.pending, (s, a) => { 
                if (a.meta.arg.offset === 0) s.loading = true; 
                s.error = null 
            })
            .addCase(fetchProducts.fulfilled, (s, a) => { 
                s.loading = false; 
                const newProds = a.payload.products;
                if (a.payload.offset === 0) {
                    s.products = newProds;
                } else {
                    s.products = [...s.products, ...newProds];
                }
                s.hasMore = newProds.length >= 20; 
            })
            .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload })
            .addCase(fetchProductById.fulfilled, (s, a) => { s.selectedProduct = a.payload })
            .addCase(fetchHomeSections.fulfilled, (s, a) => { 
                s.sections = a.payload.sections || [];
                if (a.payload.categories?.length) s.categories = a.payload.categories;
                if (a.payload.banners?.length) s.banners = a.payload.banners;
            })
    },
})

export const selectCategories = (s) => s.product.categories
export const selectProducts = (s) => s.product.products
export const selectSections = (s) => s.product.sections
export const selectBanners = (s) => s.product.banners
export const selectProductLoading = (s) => s.product.loading
export const selectHasMore = (s) => s.product.hasMore
export const selectSelectedProduct = (s) => s.product.selectedProduct

export const { clearProducts, setSelectedProduct } = productSlice.actions
export default productSlice.reducer