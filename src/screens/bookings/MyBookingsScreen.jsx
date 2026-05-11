// src/screens/bookings/MyBookingsScreen.jsx
import { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyBookings, selectMyBookings } from '../../store/slices/serviceSlice'
import { COLORS, SIZES, RADIUS, BOOKING_STATUS } from '../../utils/constants'
import { formatPrice, formatDate } from '../../utils/formatters'
import Header from '../../components/common/Header'
import { EmptyState } from '../../components/common/Helpers'
import Button from '../../components/common/Button'
import { cancelBooking } from '../../api/service.api'

export default function MyBookingsScreen({ navigation }) {
    const dispatch = useDispatch()
    const bookings = useSelector(selectMyBookings)

    useEffect(() => { dispatch(fetchMyBookings()) }, [dispatch])

    const handleCancel = (booking) => Alert.alert(
        'Cancel Booking',
        `Cancel appointment with ${booking.provider_name}?`,
        [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes', style: 'destructive', onPress: async () => {
                    await cancelBooking(booking.id, 'Customer cancelled')
                    dispatch(fetchMyBookings())
                }
            },
        ]
    )

    const renderBooking = ({ item }) => {
        const status = BOOKING_STATUS[item.status] || BOOKING_STATUS.pending
        const canCancel = ['pending', 'confirmed'].includes(item.status)

        const typeIcons = { home_visit: '🏠', video_call: '📹', clinic_visit: '🏥', chat: '💬' }

        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.providerName}>{item.provider_name}</Text>
                        <Text style={styles.category}>{item.subcategory_name || item.category_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>{formatDate(item.booking_date)}</Text>
                    <Text style={styles.detailDot}>·</Text>
                    <Text style={styles.detailText}>🕐 {item.time_slot}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>{typeIcons[item.booking_type] || '📍'}</Text>
                    <Text style={styles.detailText}>
                        {item.booking_type?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                    <Text style={styles.detailDot}>·</Text>
                    <Text style={[styles.detailText, { color: COLORS.primary, fontWeight: '700' }]}>
                        {formatPrice(item.fee)}
                    </Text>
                </View>

                {canCancel && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item)}>
                        <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="My Bookings" onBack={() => navigation.goBack()} />
            {bookings.length === 0 ? (
                <EmptyState
                    icon="📅"
                    title="No bookings yet"
                    subtitle="Book a doctor, lawyer or home service"
                    action={<Button title="Browse Services" onPress={() => navigation.navigate('HomeTab')} />}
                />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={b => b.id}
                    contentContainerStyle={styles.list}
                    renderItem={renderBooking}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    list: { padding: SIZES.lg, gap: SIZES.md, paddingBottom: 100 },
    card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border, gap: SIZES.sm },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm },
    providerName: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    category: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
    statusText: { fontSize: 11, fontWeight: '700' },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailIcon: { fontSize: 14 },
    detailText: { fontSize: 13, color: COLORS.gray600 },
    detailDot: { color: COLORS.gray300 },
    cancelBtn: { backgroundColor: COLORS.redLight, borderRadius: RADIUS.md, padding: SIZES.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.red },
    cancelBtnText: { color: COLORS.red, fontWeight: '700', fontSize: 13 },
})