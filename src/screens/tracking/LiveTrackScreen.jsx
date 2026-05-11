// src/screens/tracking/LiveTrackScreen.jsx
import { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById, selectCurrentOrder } from '../../store/slices/orderSlice'
import { COLORS, SIZES, RADIUS, SHADOW, ORDER_STATUS } from '../../utils/constants'
import { shortId } from '../../utils/formatters'

const { height } = Dimensions.get('window')

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'assigned', 'picked_up', 'delivered']

export default function LiveTrackScreen({ route, navigation }) {
    const { orderId } = route.params
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const order = useSelector(selectCurrentOrder)
    const intervalRef = useRef()

    useEffect(() => {
        dispatch(fetchOrderById(orderId))
        // Poll every 15 seconds for live updates
        intervalRef.current = setInterval(() => {
            dispatch(fetchOrderById(orderId))
        }, 15000)
        return () => clearInterval(intervalRef.current)
    }, [orderId, dispatch])

    useEffect(() => {
        if (order?.status === 'delivered') {
            clearInterval(intervalRef.current)
            navigation.replace('Delivered', { order })
        }
    }, [order?.status])

    const currentStep = STATUS_STEPS.indexOf(order?.status || 'pending')
    const statusInfo = ORDER_STATUS[order?.status] || ORDER_STATUS.pending

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.headerTitle}>Order {shortId(orderId)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusText}>{statusInfo.label}</Text>
                </View>
            </View>

            {/* Map placeholder — replace with MapView in production */}
            <View style={styles.mapPlaceholder}>
                <Text style={styles.mapEmoji}>🗺️</Text>
                <Text style={styles.mapText}>Live tracking map</Text>
                {order?.driver_name && (
                    <Text style={styles.mapDriver}>🚴 {order.driver_name} is on the way</Text>
                )}
            </View>

            {/* Status timeline */}
            <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
                <View style={styles.handle} />

                <Text style={styles.etaText}>
                    {order?.status === 'delivered' ? '✅ Delivered!' :
                        order?.eta_minutes ? `⏱ Estimated arrival: ${order.eta_minutes} min` :
                            '⏱ Preparing your order...'}
                </Text>

                {/* Steps */}
                <View style={styles.steps}>
                    {[
                        { label: 'Order Placed', icon: '📝', step: 0 },
                        { label: 'Order Confirmed', icon: '✅', step: 1 },
                        { label: 'Preparing', icon: '👨‍🍳', step: 2 },
                        { label: 'Driver Picked Up', icon: '🚴', step: 3 },
                        { label: 'Out for Delivery', icon: '🛵', step: 4 },
                        { label: 'Delivered', icon: '🎉', step: 5 },
                    ].map((s, i) => (
                        <View key={i} style={styles.step}>
                            <View style={[
                                styles.stepIcon,
                                currentStep >= s.step ? styles.stepIconDone : styles.stepIconPending,
                            ]}>
                                <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                            </View>
                            {i < 5 && <View style={[styles.stepLine, currentStep > s.step && styles.stepLineDone]} />}
                            <Text style={[styles.stepLabel, currentStep >= s.step && styles.stepLabelDone]}>
                                {s.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Driver info */}
                {order?.driver_name && order?.status !== 'pending' && (
                    <View style={styles.driverCard}>
                        <View style={styles.driverAvatar}>
                            <Text style={{ fontSize: 24 }}>🚴</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.driverName}>{order.driver_name}</Text>
                            <Text style={styles.driverSub}>Your delivery partner</Text>
                        </View>
                        {order.driver_phone && (
                            <TouchableOpacity
                                style={styles.callBtn}
                                onPress={() => Linking.openURL(`tel:${order.driver_phone}`)}
                            >
                                <Text style={styles.callIcon}>📞</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.gray900 },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5 },
    statusText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
    mapPlaceholder: { flex: 1, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm },
    mapEmoji: { fontSize: 64 },
    mapText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
    mapDriver: { fontSize: 14, color: COLORS.gray600 },
    bottomSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.lg, ...SHADOW.md },
    handle: { width: 40, height: 4, backgroundColor: COLORS.gray300, borderRadius: 2, alignSelf: 'center', marginBottom: SIZES.lg },
    etaText: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, textAlign: 'center', marginBottom: SIZES.lg },
    steps: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.lg },
    step: { alignItems: 'center', flex: 1, position: 'relative' },
    stepIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    stepIconDone: { backgroundColor: COLORS.primary },
    stepIconPending: { backgroundColor: COLORS.gray100 },
    stepLine: { position: 'absolute', top: 18, left: '50%', width: '100%', height: 2, backgroundColor: COLORS.gray200 },
    stepLineDone: { backgroundColor: COLORS.primary },
    stepLabel: { fontSize: 9, color: COLORS.gray400, textAlign: 'center' },
    stepLabelDone: { color: COLORS.primary, fontWeight: '600' },
    driverCard: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, backgroundColor: COLORS.gray50, borderRadius: RADIUS.xl, padding: SIZES.md },
    driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
    driverName: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
    driverSub: { fontSize: 12, color: COLORS.gray500 },
    callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    callIcon: { fontSize: 20 },
})