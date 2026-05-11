// src/components/product/ProductListItem.jsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateCartItem, selectProductQty } from '../../store/slices/cartSlice'
import { selectIsLoggedIn } from '../../store/slices/authSlice'
import LoginPrompt from '../common/LoginPrompt'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, RADIUS, SHADOW, SIZES } from '../../utils/constants'
import { formatPrice, getDiscount } from '../../utils/formatters'

export default function ProductListItem({ product, onPress }) {
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
                style={[styles.container, isOutOfStock && { opacity: 0.7 }]}
                disabled={isOutOfStock}
            >
                {/* Image */}
                <View style={styles.imageWrap}>
                    <Image 
                        source={{ uri: product.image || product.images?.[0] || 'https://placehold.jp/150x150.png' }} 
                        style={styles.image} 
                        resizeMode="contain" 
                    />
                    {discount > 0 && !isOutOfStock && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* Details */}
                <View style={styles.details}>
                    <View>
                        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                        <Text style={styles.unit}>{product.displayUnit || product.unit || 'per unit'}</Text>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.priceCol}>
                            <Text style={styles.price}>{formatPrice(product.price)}</Text>
                            {product.mrp > product.price && (
                                <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
                            )}
                        </View>

                        {/* Add / Qty Control */}
                        {isOutOfStock ? (
                            <View style={styles.outBtn}>
                                <Text style={styles.outText}>OUT</Text>
                            </View>
                        ) : qty === 0 ? (
                            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                                <Text style={styles.addText}>ADD</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.qtyRow}>
                                <TouchableOpacity onPress={handleDec} style={styles.qtyBtn}>
                                    <Text style={styles.qtyBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{qty}</Text>
                                <TouchableOpacity onPress={handleInc} style={styles.qtyBtn}>
                                    <Text style={styles.qtyBtnText}>+</Text>
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
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SIZES.sm,
        borderRadius: RADIUS.lg,
        marginBottom: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOW.sm,
    },
    imageWrap: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.gray50,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: { width: '85%', height: '85%' },
    discountBadge: {
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: COLORS.accent,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderTopLeftRadius: RADIUS.md,
        borderBottomRightRadius: RADIUS.md,
    },
    discountText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
    details: { flex: 1, paddingLeft: SIZES.md, justifyContent: 'space-between' },
    name: { fontSize: 14, fontWeight: '600', color: COLORS.gray900, marginBottom: 2 },
    unit: { fontSize: 12, color: COLORS.gray500, marginBottom: 8 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceCol: {},
    price: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
    mrp: { fontSize: 12, color: COLORS.gray500, textDecorationLine: 'line-through' },
    addBtn: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        width: 80, height: 32,
        justifyContent: 'center', alignItems: 'center',
    },
    addText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
    qtyRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        width: 80, height: 32,
        alignItems: 'center', justifyContent: 'space-between',
    },
    qtyBtn: { paddingHorizontal: 8, height: '100%', justifyContent: 'center' },
    qtyBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    qtyText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
    outBtn: { backgroundColor: COLORS.gray100, borderRadius: RADIUS.md, width: 80, height: 32, justifyContent: 'center', alignItems: 'center' },
    outText: { color: COLORS.gray400, fontWeight: '700', fontSize: 12 },
})
