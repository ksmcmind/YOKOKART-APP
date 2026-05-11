// src/screens/cart/DeliverySlotScreen.jsx
// No time slots — YOKOKart delivers within 24 hours
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { selectCartItems, selectCartTotal, selectCartSubtotal } from '../../store/slices/cartSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'

export default function DeliverySlotScreen({ route, navigation }) {
    const { address } = route.params
    const insets = useSafeAreaInsets()
    const items = useSelector(selectCartItems)
    const subtotal = useSelector(selectCartSubtotal)
    const total = useSelector(selectCartTotal)
    const deliveryFee = total - subtotal

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Delivery Details" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>

                {/* Address */}
                <View style={styles.addressCard}>
                    <Text style={styles.addressIcon}>📍</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.addressLabel}>Delivering to</Text>
                        <Text style={styles.addressName}>{address.name} · {address.phone}</Text>
                        <Text style={styles.addressLine}>{address.line1}, {address.city} – {address.pincode}</Text>
                    </View>
                    <Button title="Change" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
                </View>

                {/* 24h delivery promise */}
                <View style={styles.deliveryCard}>
                    <View style={styles.deliveryHeader}>
                        <Text style={styles.deliveryEmoji}>🚀</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.deliveryTitle}>Delivered within 24 hours</Text>
                            <Text style={styles.deliverySub}>Fast and reliable delivery to your door</Text>
                        </View>
                    </View>
                    <View style={styles.steps}>
                        {[
                            { icon: '✅', label: 'Order Confirmed', time: 'Instantly' },
                            { icon: '📦', label: 'Order Prepared', time: '1–2 hours' },
                            { icon: '🚴', label: 'Out for Delivery', time: 'Same day' },
                            { icon: '🏠', label: 'Delivered to You', time: 'Within 24h' },
                        ].map((s, i) => (
                            <View key={i} style={styles.step}>
                                <View style={styles.stepLeft}>
                                    <Text style={styles.stepIcon}>{s.icon}</Text>
                                    {i < 3 && <View style={styles.stepLine} />}
                                </View>
                                <View style={styles.stepInfo}>
                                    <Text style={styles.stepLabel}>{s.label}</Text>
                                    <Text style={styles.stepTime}>{s.time}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Order summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    {items.slice(0, 3).map((item, i) => (
                        <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemQty}>{item.quantity}×</Text>
                            <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                            <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                        </View>
                    ))}
                    {items.length > 3 && <Text style={styles.moreItems}>+{items.length - 3} more items</Text>}
                    <View style={styles.divider} />
                    <View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceVal}>{formatPrice(subtotal)}</Text></View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Delivery Fee</Text>
                        <Text style={[styles.priceVal, deliveryFee === 0 && { color: COLORS.primary }]}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalVal}>{formatPrice(total)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <Button
                    title={`Proceed to Pay — ${formatPrice(total)}`}
                    onPress={() => navigation.navigate('Payment', { address, total })}
                    size="lg"
                    style={{ flex: 1 }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    content: { padding: SIZES.lg, gap: SIZES.md, paddingBottom: 100 },
    addressCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
    addressIcon: { fontSize: 22 },
    addressLabel: { fontSize: 11, color: COLORS.gray400, fontWeight: '600', marginBottom: 2 },
    addressName: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
    addressLine: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
    deliveryCard: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.primary + '40' },
    deliveryHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginBottom: SIZES.lg },
    deliveryEmoji: { fontSize: 36 },
    deliveryTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
    deliverySub: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
    steps: { gap: 0 },
    step: { flexDirection: 'row', gap: SIZES.md },
    stepLeft: { alignItems: 'center', width: 32 },
    stepIcon: { fontSize: 20 },
    stepLine: { width: 2, height: 24, backgroundColor: COLORS.primary + '40', marginVertical: 2 },
    stepInfo: { flex: 1, paddingBottom: 8 },
    stepLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
    stepTime: { fontSize: 11, color: COLORS.gray500 },
    summaryCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm },
    itemQty: { fontSize: 13, fontWeight: '700', color: COLORS.gray500, width: 24 },
    itemName: { flex: 1, fontSize: 13, color: COLORS.gray700 },
    itemPrice: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
    moreItems: { fontSize: 12, color: COLORS.gray400, marginBottom: SIZES.sm },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.md },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
    priceLabel: { fontSize: 14, color: COLORS.gray500 },
    priceVal: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
    totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginTop: 4, marginBottom: 0 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    totalVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
    bottomBar: { padding: SIZES.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
})