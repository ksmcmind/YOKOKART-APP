// src/utils/constants.js
export const APP_NAME = 'YOKOKart'
export const APP_TAGLINE = 'Delivered to your door'
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http:// 192.168.101.3/api'

export const COLORS = {
    primary: '#1D9E75',
    primaryLight: '#E1F5EE',
    primaryDark: '#0F6E56',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    white: '#FFFFFF',
    black: '#111827',
    gray900: '#111827',
    gray700: '#374151',
    gray500: '#6B7280',
    gray300: '#D1D5DB',
    gray100: '#F3F4F6',
    gray50: '#F9FAFB',
    red: '#EF4444',
    redLight: '#FEE2E2',
    green: '#10B981',
    greenLight: '#D1FAE5',
    background: '#F9FAFB',
    card: '#FFFFFF',
    border: '#E5E7EB',
}

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
}

export const SIZES = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
}

export const RADIUS = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 999,
}

export const SHADOW = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
    },
}

export const ORDER_STATUS = {
    pending: { label: 'Order Placed', color: COLORS.accent },
    confirmed: { label: 'Confirmed', color: COLORS.primary },
    preparing: { label: 'Preparing', color: COLORS.primary },
    assigned: { label: 'Driver Assigned', color: COLORS.primary },
    picked_up: { label: 'Out for Delivery', color: COLORS.primary },
    delivered: { label: 'Delivered', color: COLORS.green },
    cancelled: { label: 'Cancelled', color: COLORS.red },
}

export const BOOKING_STATUS = {
    pending: { label: 'Pending', color: COLORS.accent },
    confirmed: { label: 'Confirmed', color: COLORS.primary },
    in_progress: { label: 'In Progress', color: COLORS.primary },
    completed: { label: 'Completed', color: COLORS.green },
    cancelled: { label: 'Cancelled', color: COLORS.red },
}