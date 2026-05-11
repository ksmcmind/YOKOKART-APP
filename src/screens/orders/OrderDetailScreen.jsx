// src/screens/orders/OrderDetailScreen.jsx
import { useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById, cancelOrder, selectCurrentOrder, selectOrderLoading } from '../../store/slices/orderSlice'
import { COLORS, SIZES, RADIUS, ORDER_STATUS } from '../../utils/constants'
import { formatPrice, formatDate, formatTime, shortId } from '../../utils/formatters'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import { Loader } from '../../components/common/Helpers'

export default function OrderDetailScreen({ route, navigation }) {
    const { orderId } = route.params
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const order = useSelector(selectCurrentOrder)
    const loading = useSelector(selectOrderLoading)

    useEffect(() => { dispatch(fetchOrderById(orderId)) }, [orderId, dispatch])

    const handleCancel = () => Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
                    const res = await dispatch(cancelOrder({ id: orderId, reason: 'Customer cancelled' }))
                    if (!res.error) navigation.goBack()
                }
            },
        ]
    )

    if (loading || !order) return <Loader full />

    const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending
    const canCancel = ['pending', 'confirmed'].includes(order.status)

    const STEPS = ['pending', 'confirmed', 'preparing', 'assigned', 'picked_up', 'delivered']
    const currentStep = STEPS.indexOf(order.status)

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title={`Order ${shortId(order.id)}`} onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={{ padding: SIZES.lg, gap: SIZES.md, paddingBottom: 100 }}>
                {/* Status */}
                <View style={[styles.statusCard, { borderColor: status.color }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <View>
                        <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                        <Text style={styles.statusDate}>{formatDate(order.created_at)} at {formatTime(order.created_at)}</Text>
                    </View>
                    {order.eta_minutes && order.status !== 'delivered' && (
                        <Text style={styles.eta}>~{order.eta_minutes} min</Text>
                    )}
                </View>

                {/* Timeline */}
                <View style={styles.timeline}>
                    {[
                        { label: 'Order Placed', icon: '📝', step: 0 },
                        { label: 'Confirmed', icon: '✅', step: 1 },
                        { label: 'Preparing', icon: '👨‍🍳', step: 2 },
                        { label: 'Driver Assigned', icon: '🚴', step: 3 },
                        { label: 'Out for Delivery', icon: '🛵', step: 4 },
                        { label: 'Delivered', icon: '🎉', step: 5 },
                    ].map((s, i) => (
                        <View key={i} style={styles.timelineStep}>
                            <View style={[styles.timelineDot, currentStep >= s.step && styles.timelineDotDone]}>
                                <Text style={{ fontSize: 12 }}>{s.icon}</Text>
                            </View>
                            {i < 5 && <View style={[styles.timelineLine, currentStep > s.step && styles.timelineLineDone]} />}
                            <Text style={[styles.timelineLabel, currentStep >= s.step && styles.timelineLabelDone]}>
                                {s.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Delivery address */}
                {order.delivery_address && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📍 Delivery Address</Text>
                        <Text style={styles.cardText}>{order.delivery_address.name} · {order.delivery_address.phone}</Text>
                        <Text style={styles.cardText}>{order.delivery_address.line1}</Text>
                        <Text style={styles.cardText}>{order.delivery_address.city} – {order.delivery_address.pincode}</Text>
                    </View>
                )}

                {/* Price breakdown */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💰 Price Breakdown</Text>
                    <View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceVal}>{formatPrice(order.subtotal)}</Text></View>
                    <View style={styles.priceRow}><Text style={styles.priceLabel}>Delivery</Text><Text style={styles.priceVal}>{formatPrice(order.delivery_fee || 0)}</Text></View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalVal}>{formatPrice(order.total)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Payment</Text>
                        <Text style={styles.priceVal}>{order.payment_method?.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📦 Items in this Order</Text>
                    {order.items?.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <View style={styles.itemQtyBox}>
                                <Text style={styles.itemQtyText}>{item.quantity}x</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
                                <Text style={styles.itemPrice}>{formatPrice(item.price)} per unit</Text>
                            </View>
                            <Text style={styles.itemTotal}>{formatPrice(item.subtotal)}</Text>
                        </View>
                    ))}
                </View>

                {/* Driver info */}
                {order.driver_name && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🚴 Delivery Partner</Text>
                        <Text style={styles.cardText}>{order.driver_name}</Text>
                    </View>
                )}

                {/* Actions */}
                {canCancel && (
                    <Button title="Cancel Order" variant="danger" onPress={handleCancel} />
                )}

                {order.status === 'delivered' && (
                    <Button
                        title="Reorder"
                        variant="outline"
                        onPress={() => navigation.navigate('HomeTab')}
                    />
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    statusCard: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 2 },
    statusDot: { width: 12, height: 12, borderRadius: 6 },
    statusLabel: { fontSize: 16, fontWeight: '700' },
    statusDate: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
    eta: { marginLeft: 'auto', fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
    timeline: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    timelineStep: { alignItems: 'center', flex: 1, position: 'relative' },
    timelineDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    timelineDotDone: { backgroundColor: COLORS.primary },
    timelineLine: { position: 'absolute', top: 16, left: '50%', width: '100%', height: 2, backgroundColor: COLORS.gray200 },
    timelineLineDone: { backgroundColor: COLORS.primary },
    timelineLabel: { fontSize: 8, color: COLORS.gray400, textAlign: 'center' },
    timelineLabelDone: { color: COLORS.primary, fontWeight: '600' },
    card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border, gap: SIZES.sm },
    cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
    cardText: { fontSize: 14, color: COLORS.gray600, lineHeight: 20 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    priceLabel: { fontSize: 14, color: COLORS.gray500 },
    priceVal: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    itemQtyBox: { width: 32, height: 24, borderRadius: 4, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
    itemQtyText: { fontSize: 12, fontWeight: '700', color: COLORS.gray700 },
    itemName: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
    itemPrice: { fontSize: 11, color: COLORS.gray400, marginTop: 1 },
    itemTotal: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
    totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginTop: SIZES.sm },
    totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    totalVal: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
})