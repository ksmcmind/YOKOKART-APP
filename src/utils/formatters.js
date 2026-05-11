// src/utils/formatters.js

// Price — ₹22, ₹1,299
export const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0'
    return `₹${Number(price).toLocaleString('en-IN')}`
}

// Discount percentage
export const getDiscount = (price, mrp) => {
    if (!mrp || mrp <= price) return 0
    return Math.round((mrp - price) / mrp * 100)
}

// Date — "12 Apr 2026"
export const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}

// Time — "10:30 AM"
export const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    })
}

// Relative time — "2 hours ago"
export const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
}

// Distance — "2.3 km"
export const formatDistance = (km) => {
    if (!km) return ''
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
}

// Phone — +91 98765 43210
export const formatPhone = (phone) => {
    if (!phone) return ''
    const p = phone.replace(/\D/g, '')
    return p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : phone
}

// Short order ID — #A1B2C3D4
export const shortId = (id) => id ? `#${id.slice(-8).toUpperCase()}` : ''

// ETA range — "20-25 min"
export const formatEta = (mins) => {
    if (!mins) return ''
    return `${mins - 5}-${mins + 5} min`
}