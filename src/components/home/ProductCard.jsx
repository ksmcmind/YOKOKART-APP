// src/components/home/ProductCard.jsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateCartItem, selectProductQty } from '../../store/slices/cartSlice'
import { selectIsLoggedIn } from '../../store/slices/authSlice'
import LoginPrompt from '../common/LoginPrompt'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, RADIUS, SHADOW, SIZES } from '../../utils/constants'
import { formatPrice, getDiscount } from '../../utils/formatters'

export default function ProductCard({ product, onPress, width = 150 }) {
    const dispatch = useDispatch()
    const martId = useSelector(selectMartId)
    const qty = useSelector(selectProductQty(product.id || product._id))
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const [showLogin, setShowLogin] = useState(false)
    const discount = getDiscount(product.price, product.mrp)
    const isOutOfStock = product.inventory_status === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0)

    const handleAdd = () => {
        if (!isLoggedIn) { setShowLogin(true); return }
        if (isOutOfStock) return
        dispatch(addToCart({
            productId: product.id || product._id,
            mongoProductId: product.id || product._id,
            variantId: product.variant_id || product.variants?.[0]?.variant_id || product.variants?.[0]?._id || 'default',
            martId,
            quantity: 1,
            productName: product.name,
            price: product.price,
            image: product.image || product.images?.[0]
        }))
    }

    const handleInc = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty + 1 }))
    const handleDec = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty - 1 }))

    return (
        <>
            <TouchableOpacity 
                onPress={onPress} 
                activeOpacity={0.9} 
                style={[styles.card, { width }, SHADOW.sm, isOutOfStock && { opacity: 0.7 }]}
                disabled={isOutOfStock}
            >
                {/* Discount badge */}
                {discount > 0 && !isOutOfStock && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discount}% OFF</Text>
                    </View>
                )}

                {/* Image */}
                <View style={styles.imageWrap}>
                    {product.image || product.images?.[0] ? (
                        <Image source={{ uri: product.image || product.images[0] }} style={styles.image} resizeMode="contain" />
                    ) : (
                        <Text style={{ fontSize: 30 }}>🛍️</Text>
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    {product.brand && (
                        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
                    )}
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.unit}>{product.displayUnit || product.unit || 'unit'}</Text>

                    <View style={styles.priceRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.price}>{formatPrice(product.price)}</Text>
                            {product.mrp > product.price && (
                                <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
                            )}
                        </View>

                        {/* Add to cart */}
                        {isOutOfStock ? (
                            <View style={styles.addBtnSold}>
                                <Text style={styles.addTextSold}>SOLD</Text>
                            </View>
                        ) : qty === 0 ? (
                            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
                                <Text style={styles.addText}>ADD</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.qtyControl}>
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
            {showLogin && <LoginPrompt visible={showLogin} onClose={() => setShowLogin(false)} reason='cart' />}
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 8,
    },
    discountBadge: {
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: COLORS.accent,
        borderBottomRightRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        zIndex: 1,
    },
    discountText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
    imageWrap: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    image: { width: '90%', height: '90%' },
    info: { flex: 1 },
    brand: { fontSize: 10, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 },
    name: { fontSize: 13, fontWeight: '600', color: COLORS.gray900, height: 36, marginBottom: 2 },
    unit: { fontSize: 11, color: COLORS.gray500, marginBottom: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { fontSize: 14, fontWeight: '800', color: COLORS.gray900 },
    mrp: { fontSize: 10, color: COLORS.gray500, textDecorationLine: 'line-through' },
    addBtn: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        paddingHorizontal: 12, paddingVertical: 5,
        borderWidth: 1, borderColor: COLORS.primary,
        ...SHADOW.sm,
    },
    addBtnSold: {
        backgroundColor: COLORS.gray100,
        borderRadius: RADIUS.md,
        paddingHorizontal: 8, paddingVertical: 5,
        borderWidth: 1, borderColor: COLORS.gray200,
    },
    addText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
    addTextSold: { color: COLORS.gray400, fontWeight: '700', fontSize: 10 },
    qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 4 },
    qtyBtn: { paddingHorizontal: 6 },
    qtyText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
    qty: { color: COLORS.white, fontWeight: '800', fontSize: 13, minWidth: 16, textAlign: 'center' },
})
