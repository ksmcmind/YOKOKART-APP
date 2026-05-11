// src/screens/services/BookingConfirmScreen.jsx
import { useState } from 'react'
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { bookService, selectBooking } from '../../store/slices/serviceSlice'
import { selectUser } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice, formatDate } from '../../utils/formatters'
import { getAvailableSlots } from '../../api/service.api'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'

const DATES = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
})

export default function BookingConfirmScreen({ route, navigation }) {
    const { provider, bookingType, fee } = route.params
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const user = useSelector(selectUser)
    const booking = useSelector(selectBooking)

    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [slots, setSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [notes, setNotes] = useState('')

    const handleDateSelect = async (date) => {
        setSelectedDate(date)
        setSelectedSlot(null)
        setLoadingSlots(true)
        try {
            const dateStr = date.toISOString().split('T')[0]
            const res = await getAvailableSlots(provider.id, dateStr)
            setSlots(res.data?.slots || [])
        } catch { setSlots([]) }
        setLoadingSlots(false)
    }

    const handleBook = async () => {
        if (!selectedDate || !selectedSlot) {
            Alert.alert('Please select date and time slot')
            return
        }
        const dateStr = selectedDate.toISOString().split('T')[0]
        const res = await dispatch(bookService({
            providerId: provider.id,
            bookingDate: dateStr,
            timeSlot: selectedSlot,
            bookingType,
            userNotes: notes,
        }))
        if (!res.error) {
            Alert.alert(
                'Booking Confirmed! 🎉',
                `Your appointment is confirmed for ${formatDate(selectedDate)} at ${selectedSlot}`,
                [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
            )
        } else {
            Alert.alert('Booking Failed', res.payload || 'Please try again')
        }
    }

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Book Appointment" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Provider summary */}
                <View style={styles.providerCard}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerSub}>{provider.subcategoryName || provider.categoryName}</Text>
                    <View style={styles.typeTag}>
                        <Text style={styles.typeTagText}>
                            {bookingType === 'home_visit' ? '🏠 Home Visit' : bookingType === 'video_call' ? '📹 Video Call' : '🏥 Clinic'}
                        </Text>
                    </View>
                </View>

                {/* Date selector */}
                <Text style={styles.label}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                    {DATES.map((date, i) => {
                        const isSelected = selectedDate?.toDateString() === date.toDateString()
                        return (
                            <TouchableOpacity
                                key={i}
                                style={[styles.dateBtn, isSelected && styles.dateBtnActive]}
                                onPress={() => handleDateSelect(date)}
                            >
                                <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                                    {DAY_NAMES[date.getDay()]}
                                </Text>
                                <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>
                                    {date.getDate()}
                                </Text>
                                <Text style={[styles.dateMon, isSelected && styles.dateTextActive]}>
                                    {date.toLocaleString('en', { month: 'short' })}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>

                {/* Time slots */}
                {selectedDate && (
                    <>
                        <Text style={styles.label}>Select Time Slot</Text>
                        {loadingSlots ? (
                            <Text style={styles.loadingText}>Loading slots...</Text>
                        ) : slots.length === 0 ? (
                            <Text style={styles.noSlots}>No slots available on this day</Text>
                        ) : (
                            <View style={styles.slotsGrid}>
                                {slots.map((s, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.slotBtn,
                                            !s.available && styles.slotDisabled,
                                            selectedSlot === s.slot && styles.slotActive,
                                        ]}
                                        onPress={() => s.available && setSelectedSlot(s.slot)}
                                        disabled={!s.available}
                                    >
                                        <Text style={[styles.slotText, selectedSlot === s.slot && styles.slotTextActive]}>
                                            {s.slot}
                                        </Text>
                                        {!s.available && <Text style={styles.slotBooked}>Booked</Text>}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* Notes */}
                <Text style={styles.label}>Notes for Provider (optional)</Text>
                <TextInput
                    style={styles.notesInput}
                    multiline
                    numberOfLines={3}
                    placeholder="Describe your issue or any special requirements..."
                    placeholderTextColor={COLORS.gray400}
                    value={notes}
                    onChangeText={setNotes}
                />

                {/* Fee summary */}
                <View style={styles.feeSummary}>
                    <Text style={styles.feeSummaryTitle}>Booking Summary</Text>
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Consultation Fee</Text>
                        <Text style={styles.feeValue}>{formatPrice(provider.consultationFee)}</Text>
                    </View>
                    {bookingType === 'home_visit' && provider.homeVisitFee > 0 && (
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Home Visit Charge</Text>
                            <Text style={styles.feeValue}>{formatPrice(provider.homeVisitFee)}</Text>
                        </View>
                    )}
                    <View style={[styles.feeRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatPrice(fee)}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Confirm button */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <Button
                    title={`Confirm Booking — ${formatPrice(fee)}`}
                    onPress={handleBook}
                    loading={booking}
                    disabled={!selectedDate || !selectedSlot}
                    size="lg"
                    style={{ flex: 1 }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    content: { padding: SIZES.lg },
    providerCard: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.xl, padding: SIZES.lg, marginBottom: SIZES.xl, borderWidth: 1, borderColor: COLORS.primary },
    providerName: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
    providerSub: { fontSize: 13, color: COLORS.gray600, marginBottom: 8 },
    typeTag: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
    typeTagText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
    label: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md, marginTop: SIZES.sm },
    dateScroll: { marginBottom: SIZES.xl },
    dateBtn: { width: 64, paddingVertical: SIZES.md, marginRight: SIZES.sm, borderRadius: RADIUS.lg, backgroundColor: COLORS.white, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    dateBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    dateDay: { fontSize: 11, color: COLORS.gray500, fontWeight: '600' },
    dateNum: { fontSize: 22, fontWeight: '800', color: COLORS.gray900, marginVertical: 2 },
    dateMon: { fontSize: 11, color: COLORS.gray500 },
    dateTextActive: { color: COLORS.white },
    loadingText: { color: COLORS.gray500, fontSize: 14, textAlign: 'center', marginBottom: SIZES.xl },
    noSlots: { color: COLORS.red, fontSize: 14, textAlign: 'center', marginBottom: SIZES.xl },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.xl },
    slotBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
    slotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    slotDisabled: { backgroundColor: COLORS.gray100, borderColor: COLORS.gray200 },
    slotText: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
    slotTextActive: { color: COLORS.white },
    slotBooked: { fontSize: 9, color: COLORS.gray400, textAlign: 'center' },
    notesInput: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, fontSize: 14, color: COLORS.gray900, textAlignVertical: 'top', minHeight: 80, marginBottom: SIZES.xl },
    feeSummary: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    feeSummaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
    feeLabel: { fontSize: 14, color: COLORS.gray600 },
    feeValue: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
    totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginTop: SIZES.sm, marginBottom: 0 },
    totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
    totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
    bottomBar: { backgroundColor: COLORS.white, padding: SIZES.lg, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
})