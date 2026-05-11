// src/screens/products/ProductListItem.jsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateCartItem, selectProductQty } from '../../store/slices/cartSlice'
import { selectIsLoggedIn, selectMartId } from '../../store/slices/authSlice'
import LoginPrompt from '../common/LoginPrompt'
import { COLORS, RADIUS, SIZES, SHADOW } from '../../utils/constants'
import { formatPrice, getDiscount } from '../../utils/formatters'

export default function ProductListItem({ product, onPress }) {
    const dispatch = useDispatch()
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const martId = useSelector(selectMartId)
    const qty = useSelector(selectProductQty(product.id || product._id))
    const [showLogin, setShowLogin] = useState(false)
    const discount = getDiscount(product.price, product.mrp)
    const isOutOfStock = product.inventory_status === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0)

    const handleAdd = () => {
        if (!isLoggedIn) {
            setShowLogin(true)
            return
        }
        if (isOutOfStock) return

        dispatch(addToCart({
            productId: product.id || product._id,
            mongoProductId: product.id || product._id,
            variantId: product.variant_id || product.variants?.[0]?.variant_id || product.variants?.[0]?._id || 'default',
            martId,
            quantity: 1,
            productName: product.name,
            price: product.price,
            image: product.image || product.images?.[0],
        }))
    }

    const handleInc = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty + 1 }))
    const handleDec = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty - 1 }))

    return (
        <>
            <TouchableOpacity
                style={[styles.card, SHADOW.sm, isOutOfStock && { opacity: 0.7 }]}
                onPress={onPress}
                activeOpacity={0.9}
                disabled={isOutOfStock}
            >
                <View style={styles.imageWrap}>
                    {product.image || product.images?.[0] ? (
                        <Image source={{ uri: product.image || product.images[0] }} style={styles.image} resizeMode="contain" />
                    ) : (
                        <Text style={{ fontSize: 36 }}>🛍️</Text>
                    )}
                    {discount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{discount}%</Text>
                        </View>
                    )}
                </View>

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                    {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
                    <Text style={styles.unit}>{product.displayUnit || product.unit || ''}</Text>

                    <View style={styles.bottom}>
                        <View>
                            <Text style={styles.price}>{formatPrice(product.price)}</Text>
                            {product.mrp > product.price && (
                                <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
                            )}
                        </View>

                        {isOutOfStock ? (
                            <View style={styles.outBtn}>
                                <Text style={styles.outText}>OUT</Text>
                            </View>
                        ) : qty === 0 ? (
                            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
                                <Text style={styles.addText}>ADD</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.qtyCtrl}>
                                <TouchableOpacity onPress={handleDec} style={styles.qtyBtn}>
                                    <Text style={styles.qtyText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qty}>{qty}</Text>
                                <TouchableOpacity onPress={handleInc} style={styles.qtyBtn}>
                                    <Text style={styles.qtyText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {showLogin && <LoginPrompt visible={showLogin} onClose={() => setShowLogin(false)} reason="cart" />}
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageWrap: {
        width: 110,
        height: 110,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: { width: '85%', height: '85%' },
    badge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: COLORS.accent,
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
    info: { flex: 1, padding: SIZES.md, justifyContent: 'space-between' },
    name: { fontSize: 14, fontWeight: '600', color: COLORS.gray900, lineHeight: 19 },
    brand: { fontSize: 11, color: COLORS.gray400, marginTop: 1 },
    unit: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
    bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    price: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    mrp: { fontSize: 11, color: COLORS.gray400, textDecorationLine: 'line-through' },
    addBtn: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    addText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
    outBtn: {
        backgroundColor: COLORS.gray100,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    outText: { color: COLORS.gray400, fontWeight: '700', fontSize: 13 },
    qtyCtrl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.sm,
    },
    qtyBtn: { paddingHorizontal: 10, paddingVertical: 7 },
    qtyText: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 20 },
    qty: { color: COLORS.white, fontWeight: '700', fontSize: 14, minWidth: 20, textAlign: 'center' },
})