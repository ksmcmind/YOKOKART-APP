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

export default function ProductCard({ product, onPress, width = 160 }) {
  const dispatch = useDispatch()
  const martId = useSelector(selectMartId)
  const qty = useSelector(selectProductQty(product.id || product._id))
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const [showLogin, setShowLogin] = useState(false)
  const discount = getDiscount(product.price, product.mrp)

  const handleAdd = () => {
    if (!isLoggedIn) { setShowLogin(true); return }
    dispatch(addToCart({
      productId: product.id || product._id,
      mongoProductId: product.id || product._id,
      variantId: product.variant_id || product.variants?.[0]?.variant_id || product.variants?.[0]?._id || 'default',
      martId,
      quantity: 1,
      productName: product.name,
      price: product.price,
    }))
  }

  const handleInc = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty + 1 }))
  const handleDec = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty - 1 }))

  return (
    <>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, { width }, SHADOW.sm]}>
        {/* Discount badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Image */}
        <View style={styles.imageWrap}>
          {product.image || product.images?.[0] ? (
            <Image source={{ uri: product.image || product.images[0] }} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 40 }}>🛍️</Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.unit}>{product.displayUnit || product.unit || ''}</Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              {product.mrp > product.price && (
                <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
              )}
            </View>

            {/* Add to cart */}
            {qty === 0 ? (
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
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginRight: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  discountBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  imageWrap: {
    height: 120,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '80%', height: '80%' },
  info: { padding: SIZES.md },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.gray900, lineHeight: 18, marginBottom: 2 },
  unit: { fontSize: 11, color: COLORS.gray500, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
  mrp: { fontSize: 11, color: COLORS.gray500, textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  addText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.sm },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyText: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 20 },
  qty: { color: COLORS.white, fontWeight: '700', fontSize: 14, minWidth: 20, textAlign: 'center' },
})