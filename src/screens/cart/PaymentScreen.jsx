// src/screens/cart/PaymentScreen.jsx
import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { placeOrder, selectOrderPlacing } from '../../store/slices/orderSlice'
import { fetchCart } from '../../store/slices/cartSlice'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'
import { createRazorpayOrder, verifyPayment } from '../../api/order.api'
import RazorpayCheckout from 'react-native-razorpay'

const GOOGLE_API_KEY = 'AIzaSyC7gjVyUuiv_LE8aveaFGAlR-w09CAu3NM'

const PAYMENT_METHODS = [
    { id: 'razorpay', label: 'UPI / Card / Net Banking', icon: '💳', sub: 'Pay securely via Razorpay' },
    { id: 'cod', label: 'Cash on Delivery', icon: '💵', sub: 'Pay when you receive' },
]

export default function PaymentScreen({ route, navigation }) {
    const { address, slot, total } = route.params
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const placing = useSelector(selectOrderPlacing)
    const martId = useSelector(selectMartId)

    const [method, setMethod] = useState('razorpay')
    const [notes, setNotes] = useState('Call on arrival')

    const geocodeAddress = async (addr) => {
        if (addr.lat && addr.lng) return addr
        const addressQuery = [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ')
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${GOOGLE_API_KEY}`
        const response = await axios.get(url)
        const data = response.data
        if (data?.status === 'OK' && data.results?.length > 0) {
            const location = data.results[0].geometry.location
            return { ...addr, lat: location.lat, lng: location.lng }
        }
        throw new Error(data?.error_message || 'Unable to resolve address location')
    }

    const handleRazorpay = async () => {
        try {
            // Create Razorpay order
            const orderRes = await createRazorpayOrder(total)
            const resData = orderRes.data
            if (!resData.success) throw new Error(resData.message || 'Failed to create order')

            const options = {
                description: 'YOKOKart Order',
                image: 'https://storage.googleapis.com/ksmcm-media/logo.png',
                currency: 'INR',
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
                amount: total * 100,
                order_id: resData.data.razorpayOrderId,
                name: 'YOKOKart',
                prefill: { contact: address.phone },
                theme: { color: COLORS.primary },
            }

            const payment = await RazorpayCheckout.open(options)

            // Verify payment
            const verifyRes = await verifyPayment({
                razorpayOrderId: resData.data.razorpayOrderId,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpaySignature: payment.razorpay_signature,
            })

            if (verifyRes.data?.success) {
                await handlePlaceOrder('razorpay', resData.data.razorpayOrderId, payment.razorpay_payment_id)
            } else {
                Alert.alert('Payment Verification Failed', verifyRes.data?.message || 'Please try again')
            }
        } catch (err) {
            if (err.code !== 'PAYMENT_CANCELLED') {
                Alert.alert('Payment failed', err.description || err.message || 'Please try again')
            }
        }
    }

    const handlePlaceOrder = async (paymentMethod, razorpayOrderId = null, razorpayPaymentId = null) => {
        let finalAddress = address
        try {
            finalAddress = await geocodeAddress(address)
        } catch (err) {
            Alert.alert('Address Error', err.message || 'Unable to resolve delivery location')
            return
        }

        const payload = {
            martId,
            deliveryAddress: {
                ...finalAddress,
                address_line: [finalAddress.line1, finalAddress.line2].filter(Boolean).join(', '),
            },
            deliveryNotes: notes,
            paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
            deliverySlot: slot?.id,
            razorpayOrderId,
            razorpayPaymentId,
        }

        const res = await dispatch(placeOrder(payload))

        if (!res.error) {
            dispatch(fetchCart())
            navigation.replace('LiveTrack', { orderId: res.payload.id })
        } else {
            Alert.alert('Order Failed', res.payload || 'Please try again')
        }
    }

    const handlePay = () => {
        if (method === 'razorpay') handleRazorpay()
        else handlePlaceOrder('cod')
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Payment" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Order summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery to</Text>
                        <Text style={styles.summaryVal} numberOfLines={1}>{address.line1}, {address.city}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery time</Text>
                        <Text style={styles.summaryVal}>{slot?.time || 'Express'}</Text>
                    </View>
                    <View style={styles.notesBlock}>
                        <Text style={styles.notesLabel}>Delivery Instructions</Text>
                        <TextInput
                            style={styles.notesInput}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Call on arrival"
                            multiline
                            placeholderTextColor={COLORS.gray300}
                        />
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalVal}>{formatPrice(total)}</Text>
                    </View>
                </View>

                {/* Payment methods */}
                <Text style={styles.sectionTitle}>Select Payment Method</Text>
                {PAYMENT_METHODS.map(pm => (
                    <TouchableOpacity
                        key={pm.id}
                        style={[styles.methodCard, method === pm.id && styles.methodCardActive]}
                        onPress={() => setMethod(pm.id)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.methodIcon}>{pm.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.methodLabel}>{pm.label}</Text>
                            <Text style={styles.methodSub}>{pm.sub}</Text>
                        </View>
                        <View style={[styles.radio, method === pm.id && styles.radioActive]} />
                    </TouchableOpacity>
                ))}

                {/* Security note */}
                <View style={styles.secureNote}>
                    <Text style={styles.secureIcon}>🔒</Text>
                    <Text style={styles.secureText}>
                        Your payment is secured with 256-bit SSL encryption via Razorpay
                    </Text>
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}> 
                <Button
                    title={`${method === 'cod' ? 'Place Order' : 'Pay'} ${formatPrice(total)} →`}
                    onPress={handlePay}
                    loading={placing}
                    size="lg"
                    style={{ flex: 1 }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    content: { padding: SIZES.lg, gap: SIZES.md, paddingBottom: 100 },
    summaryCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm, gap: SIZES.md },
    summaryLabel: { fontSize: 14, color: COLORS.gray500 },
    summaryVal: { fontSize: 14, fontWeight: '600', color: COLORS.gray900, flex: 1, textAlign: 'right' },
    totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginBottom: 0, marginTop: SIZES.sm },
    totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    totalVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900 },
    methodCard: {
        flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
        backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg,
        borderWidth: 2, borderColor: COLORS.border,
    },
    methodCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    methodIcon: { fontSize: 28 },
    methodLabel: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
    methodSub: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.gray300 },
    notesBlock: { marginTop: SIZES.md },
    notesLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gray700, marginBottom: 8 },
    notesInput: { minHeight: 80, backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top', color: COLORS.gray900 },
    radioActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
    secureNote: { flexDirection: 'row', gap: SIZES.sm, backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SIZES.md, alignItems: 'center' },
    secureIcon: { fontSize: 20 },
    secureText: { flex: 1, fontSize: 12, color: COLORS.gray500, lineHeight: 17 },
    bottomBar: { padding: SIZES.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
})