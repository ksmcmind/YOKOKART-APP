// src/screens/orders/OrderHistoryScreen.jsx
import { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrders, selectOrders, selectOrderLoading, handleReorder } from '../../store/slices/orderSlice'
import { COLORS, SIZES, RADIUS, ORDER_STATUS } from '../../utils/constants'
import { formatPrice, formatDate, shortId } from '../../utils/formatters'
import Header from '../../components/common/Header'
import { Loader, EmptyState } from '../../components/common/Helpers'
import Button from '../../components/common/Button'

export default function OrderHistoryScreen({ navigation }) {
    const dispatch = useDispatch()
    const orders = useSelector(selectOrders)
    const loading = useSelector(selectOrderLoading)

    useEffect(() => { dispatch(fetchOrders()) }, [dispatch])

    const onReorder = async (order) => {
        try {
            await dispatch(handleReorder(order)).unwrap()
            navigation.navigate('CartTab', { screen: 'Cart' })
        } catch (err) {
            console.warn('Reorder failed:', err)
        }
    }

    const renderOrder = ({ item: order }) => {
        const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending
        const isActive = ['pending', 'confirmed', 'preparing', 'assigned', 'picked_up'].includes(order.status)

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                activeOpacity={0.8}
            >
                <View style={styles.orderTop}>
                    <Text style={styles.orderId}>#{shortId(order.id)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>

                <View style={styles.orderBottom}>
                    <View>
                        <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                        <Text style={styles.orderItems}>{order.order_type} · {order.payment_method?.toUpperCase()}</Text>
                    </View>
                    {isActive ? (
                        <TouchableOpacity
                            style={styles.trackBtn}
                            onPress={() => navigation.navigate('CartTab', { screen: 'LiveTrack', params: { orderId: order.id } })}
                        >
                            <Text style={styles.trackBtnText}>Track →</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.reorderBtn}
                            onPress={() => onReorder(order)}
                        >
                            <Text style={styles.reorderText}>Reorder</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="My Orders" />
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                    <Text style={[styles.tabText, styles.tabTextActive]}>All Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate('MyBookings')}
                >
                    <Text style={styles.tabText}>Service Bookings</Text>
                </TouchableOpacity>
            </View>
            {loading ? <Loader full /> : orders.length === 0 ? (
                <EmptyState
                    icon="📦"
                    title="No orders yet"
                    subtitle="Your order history will appear here"
                    action={<Button title="Start Shopping" onPress={() => navigation.navigate('HomeTab')} />}
                />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={o => o.id}
                    contentContainerStyle={styles.list}
                    renderItem={renderOrder}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    tabs: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
    tabText: { fontSize: 14, fontWeight: '500', color: COLORS.gray500 },
    tabTextActive: { color: COLORS.primary, fontWeight: '700' },
    list: { padding: SIZES.lg, gap: SIZES.sm, paddingBottom: 100 },
    orderCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    orderId: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, fontFamily: 'monospace' },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
    statusText: { fontSize: 11, fontWeight: '700' },
    orderDate: { fontSize: 12, color: COLORS.gray400, marginBottom: SIZES.md },
    orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    orderTotal: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
    orderItems: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
    trackBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 8 },
    trackBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
    reorderBtn: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary },
    reorderText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
    chevron: { fontSize: 24, color: COLORS.gray300 },
})