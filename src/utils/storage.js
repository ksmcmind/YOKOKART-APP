// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage'

export const storage = {
    get: async (key) => {
        try {
            const val = await AsyncStorage.getItem(key)
            return val ? JSON.parse(val) : null
        } catch { return null }
    },
    set: async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value))
        } catch { }
    },
    remove: async (key) => {
        try { await AsyncStorage.removeItem(key) } catch { }
    },
    clear: async () => {
        try { await AsyncStorage.clear() } catch { }
    },
}

// Auth specific - token is a string, store it directly
export const getToken = async () => {
    try {
        return await AsyncStorage.getItem('token')
    } catch { return null }
}

export const setToken = async (t) => {
    try {
        await AsyncStorage.setItem('token', t)
    } catch { }
}

export const getUser = async () => storage.get('user')
export const setUser = async (u) => storage.set('user', u)
export const getMartId = async () => storage.get('martId')
export const setMartId = async (id) => storage.set('martId', id)