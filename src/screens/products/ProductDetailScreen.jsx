// src/screens/products/ProductDetailScreen.jsx
import { useEffect, useState } from 'react'
import {
    View, Text, ScrollView, StyleSheet, Image,
    TouchableOpacity, Dimensions, FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, selectSelectedProduct } from '../../store/slices/productSlice'
import { addToCart, updateCartItem, selectProductQty } from '../../store/slices/cartSlice'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice, getDiscount } from '../../utils/formatters'
import Button from '../../components/common/Button'

const { width } = Dimensions.get('window')

export default function ProductDetailScreen({ route, navigation }) {
    const { product: routeProduct } = route.params
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const martId = useSelector(selectMartId)
    const full = useSelector(selectSelectedProduct)
    const qty = useSelector(selectProductQty(routeProduct.id || routeProduct._id))

    const [imgIdx, setImgIdx] = useState(0)

    const product = full?.id === (routeProduct.id || routeProduct._id) ? full : routeProduct
    const images = product.images?.length ? product.images : [product.image].filter(Boolean)
    const discount = getDiscount(product.price, product.mrp)
    const details = product.details || {}
    const isOutOfStock = product.inventory_status === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0)

    useEffect(() => {
        if (martId && (routeProduct.id || routeProduct._id)) {
            dispatch(fetchProductById({ martId, productId: routeProduct.id || routeProduct._id }))
        }
    }, [routeProduct.id, routeProduct._id, martId, dispatch])

    const handleAdd = () => dispatch(addToCart({
        productId: product.id || product._id,
        mongoProductId: product.id || product._id,
        variantId: product.variant_id || product.variants?.[0]?.variant_id || product.variants?.[0]?._id || 'default',
        martId, quantity: 1,
        productName: product.name, price: product.price,
    }))
    const handleInc = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty + 1 }))
    const handleDec = () => dispatch(updateCartItem({ productId: product.id || product._id, quantity: qty - 1 }))

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            {/* Back button */}
            <TouchableOpacity
                style={[styles.backBtn, { top: insets.top + 12 }]}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image gallery */}
                <View style={styles.gallery}>
                    {images.length > 0 ? (
                        <>
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={e => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
                            >
                                {images.map((img, i) => (
                                    <Image key={i} source={{ uri: img }} style={[styles.mainImage, { width }]} resizeMode="contain" />
                                ))}
                            </ScrollView>
                            {images.length > 1 && (
                                <View style={styles.dots}>
                                    {images.map((_, i) => (
                                        <View key={i} style={[styles.dot, i === imgIdx && styles.dotActive]} />
                                    ))}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={[styles.mainImage, { width, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 80 }}>🛍️</Text>
                        </View>
                    )}

                    {discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{discount}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* Product info */}
                <View style={styles.info}>
                    {/* Name + brand */}
                    <Text style={styles.name}>{product.name}</Text>
                    {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
                    <Text style={styles.unit}>{product.displayUnit || product.unit || ''}</Text>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{formatPrice(product.price)}</Text>
                        {product.mrp > product.price && (
                            <Text style={styles.mrp}>MRP {formatPrice(product.mrp)}</Text>
                        )}
                        {discount > 0 && (
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>Save {formatPrice(product.mrp - product.price)}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    {product.description && (
                        <>
                            <Text style={styles.sectionTitle}>About this product</Text>
                            <Text style={styles.description}>{product.description}</Text>
                            <View style={styles.divider} />
                        </>
                    )}

                    {/* Details — key/value pairs */}
                    {Object.keys(details).length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Product Details</Text>
                            <View style={styles.detailsTable}>
                                {Object.entries(details).map(([key, value]) => (
                                    <View key={key} style={styles.detailRow}>
                                        <Text style={styles.detailKey}>
                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                                        </Text>
                                        <Text style={styles.detailValue}>{value}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Bottom add to cart */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <View style={styles.bottomPrice}>
                    <Text style={styles.bottomPriceLabel}>Total</Text>
                    <Text style={styles.bottomPriceValue}>{formatPrice(product.price * (qty || 1))}</Text>
                </View>

                {isOutOfStock ? (
                    <Button
                        title="Sold Out"
                        disabled
                        style={{ flex: 1, backgroundColor: COLORS.gray300 }}
                        size="lg"
                    />
                ) : qty === 0 ? (
                    <Button
                        title="Add to Cart"
                        onPress={handleAdd}
                        icon="🛒"
                        style={{ flex: 1 }}
                        size="lg"
                    />
                ) : (
                    <View style={styles.qtyControl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={handleDec}>
                            <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyCount}>{qty} in cart</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={handleInc}>
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    backBtn: {
        position: 'absolute', left: 16, zIndex: 10,
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center',
        ...SHADOW.sm,
    },
    backIcon: { fontSize: 20, color: COLORS.gray900 },
    gallery: { backgroundColor: COLORS.gray50 },
    mainImage: { height: 300 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gray300 },
    dotActive: { backgroundColor: COLORS.primary, width: 20 },
    discountBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingHorizontal: 10, paddingVertical: 5 },
    discountText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

    info: { padding: SIZES.lg },
    name: { fontSize: 20, fontWeight: '700', color: COLORS.gray900, marginBottom: 4, lineHeight: 26 },
    brand: { fontSize: 13, color: COLORS.gray400, marginBottom: 2 },
    unit: { fontSize: 13, color: COLORS.gray500, marginBottom: SIZES.md },

    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    price: { fontSize: 26, fontWeight: '800', color: COLORS.gray900 },
    mrp: { fontSize: 15, color: COLORS.gray400, textDecorationLine: 'line-through' },
    saveBadge: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
    saveText: { color: COLORS.primary, fontWeight: '600', fontSize: 12 },

    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.lg },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md },
    description: { fontSize: 14, color: COLORS.gray600, lineHeight: 22 },

    detailsTable: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    detailRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    detailKey: { flex: 1, padding: SIZES.md, backgroundColor: COLORS.gray50, fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
    detailValue: { flex: 1.5, padding: SIZES.md, fontSize: 13, color: COLORS.gray900 },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white,
        flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
        paddingHorizontal: SIZES.lg, paddingTop: SIZES.md,
        borderTopWidth: 1, borderTopColor: COLORS.border,
        ...SHADOW.md,
    },
    bottomPrice: {},
    bottomPriceLabel: { fontSize: 11, color: COLORS.gray500 },
    bottomPriceValue: { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
    qtyControl: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, overflow: 'hidden' },
    qtyBtn: { padding: 14 },
    qtyBtnText: { color: COLORS.white, fontSize: 22, fontWeight: '700', lineHeight: 24 },
    qtyCount: { flex: 1, textAlign: 'center', color: COLORS.white, fontWeight: '700', fontSize: 15 },
})