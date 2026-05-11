// src/screens/cart/CartScreen.jsx
// Shows login prompt if guest tries to access
import { useEffect, useState } from 'react'
import {
    View, Text, FlatList, StyleSheet, Image,
    TouchableOpacity, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchCart, updateCartItem, clearCartAction,
    selectCartItems, selectCartTotal, selectCartSubtotal, selectCartLoading,
} from '../../store/slices/cartSlice'
import { selectIsLoggedIn } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice, getDiscount } from '../../utils/formatters'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import { EmptyState } from '../../components/common/Helpers'
import { Loader } from '../../components/common/Helpers'
import LoginPrompt from '../../components/common/LoginPrompt'

export default function CartScreen({ navigation }) {
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const items = useSelector(selectCartItems)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalMrp = items.reduce((sum, item) => sum + ((item.mrp || item.price) * item.quantity), 0)
    const totalDiscount = totalMrp - subtotal
    const total = subtotal + deliveryFee
    const loading = useSelector(selectCartLoading)

    const deliveryFee = 0  // Keep delivery fee as 0

    useEffect(() => {
        if (isLoggedIn) dispatch(fetchCart())
    }, [isLoggedIn, dispatch])

    // Guest — show login prompt
    if (!isLoggedIn) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                <Header title="My Cart" />
                <EmptyState
                    icon="🛒"
                    title="Your cart is empty"
                    subtitle="Sign in to add items and place orders"
                    action={
                        <Button
                            title="Sign In / Register"
                            onPress={() => navigation.navigate('AuthFlow', { screen: 'Login' })}
                        />
                    }
                />
            </View>
        )
    }

    const handleClear = () => Alert.alert(
        'Clear Cart', 'Remove all items?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => dispatch(clearCartAction()) },
        ]
    )

    if (loading) return <Loader full />

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header
                title="My Cart"
                subtitle={items.length > 0 ? `${items.length} items` : ''}
                right={items.length > 0 ? (
                    <TouchableOpacity onPress={handleClear}>
                        <Text style={{ color: COLORS.red, fontSize: 13, fontWeight: '600' }}>Clear</Text>
                    </TouchableOpacity>
                ) : null}
            />

            {items.length === 0 ? (
                <EmptyState
                    icon="🛒"
                    title="Your cart is empty"
                    subtitle="Add items to get started"
                    action={<Button title="Shop Now" onPress={() => navigation.navigate('HomeTab')} />}
                />
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={i => i.mongoProductId}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <View style={[styles.cartItem, SHADOW.sm]}>
                                <View style={styles.itemImage}>
                                    {item.image ? (
                                        <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
                                    ) : <Text style={{ fontSize: 28 }}>🛍️</Text>}
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                                    <Text style={styles.itemUnit}>{item.displayUnit || item.unit || ''}</Text>
                                    <View style={styles.priceRow}>
                                        {item.mrp > item.price ? (
                                            <>
                                                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                                                <Text style={styles.itemMrp}>{formatPrice(item.mrp)}</Text>
                                                <Text style={styles.itemDiscount}>{getDiscount(item.price, item.mrp)}% OFF</Text>
                                            </>
                                        ) : (
                                            <Text style={styles.itemPrice}>{formatPrice(item.price)} each</Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.itemRight}>
                                    <View style={styles.qtyCtrl}>
                                        <TouchableOpacity style={styles.qtyBtn}
                                            onPress={() => dispatch(updateCartItem({ productId: item.mongoProductId, quantity: item.quantity - 1 }))}>
                                            <Text style={styles.qtyBtnText}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.qty}>{item.quantity}</Text>
                                        <TouchableOpacity style={styles.qtyBtn}
                                            onPress={() => dispatch(updateCartItem({ productId: item.mongoProductId, quantity: item.quantity + 1 }))}>
                                            <Text style={styles.qtyBtnText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
                                </View>
                            </View>
                        )}
                    />
                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Price Breakdown</Text>
                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text><Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text></View>
                        {totalDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Savings</Text>
                                <Text style={[styles.summaryValue, { color: COLORS.primary }]}>-{formatPrice(totalDiscount)}</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={[styles.summaryValue, deliveryFee === 0 && { color: COLORS.primary }]}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                        </View>
                    </View>
                    <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                        <View>
                            <Text style={styles.totalSmall}>{formatPrice(total)}</Text>
                            <Text style={styles.totalHint}>
                                {items.length} items{totalDiscount > 0 ? ` · Saved ${formatPrice(totalDiscount)}` : ''} · incl. delivery
                            </Text>
                        </View>
                        <Button
                            title="Proceed to Checkout →"
                            onPress={() => navigation.navigate('Address')}
                            style={{ flex: 1 }}
                            size="lg"
                        />
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    list: { padding: SIZES.lg, gap: SIZES.sm, paddingBottom: SIZES.md },
    cartItem: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SIZES.md, gap: SIZES.md, borderWidth: 1, borderColor: COLORS.border },
    itemImage: { width: 70, height: 70, backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
    image: { width: '85%', height: '85%' },
    itemInfo: { flex: 1, justifyContent: 'space-between' },
    itemName: { fontSize: 14, fontWeight: '600', color: COLORS.gray900, lineHeight: 18 },
    itemUnit: { fontSize: 12, color: COLORS.gray400 },
    itemPrice: { fontSize: 12, color: COLORS.gray500 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
    itemMrp: { fontSize: 12, color: COLORS.gray400, textDecorationLine: 'line-through' },
    itemDiscount: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
    itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
    qtyCtrl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.sm },
    qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
    qtyBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 20 },
    qty: { color: COLORS.white, fontWeight: '700', fontSize: 14, minWidth: 20, textAlign: 'center' },
    itemTotal: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
    summary: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, marginTop: SIZES.md, marginHorizontal: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
    summaryLabel: { fontSize: 14, color: COLORS.gray600 },
    summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
    totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginTop: SIZES.sm, marginBottom: 0 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
    bottomBar: { backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', gap: SIZES.md, paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
    totalSmall: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
    totalHint: { fontSize: 11, color: COLORS.gray400 },
})