// src/screens/tracking/DeliveredScreen.jsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, SIZES, RADIUS } from '../../utils/constants'
import { formatPrice, shortId } from '../../utils/formatters'
import Button from '../../components/common/Button'

export default function DeliveredScreen({ route, navigation }) {
    const { order } = route.params
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
            {/* Success animation placeholder */}
            <View style={styles.successCircle}>
                <Text style={styles.successEmoji}>🎉</Text>
            </View>

            <Text style={styles.title}>Order Delivered!</Text>
            <Text style={styles.subtitle}>
                Your order {shortId(order?.id)} has been{'\n'}delivered successfully
            </Text>

            {/* Order detail */}
            <View style={styles.card}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Order ID</Text>
                    <Text style={styles.cardVal}>{shortId(order?.id)}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Amount Paid</Text>
                    <Text style={[styles.cardVal, { color: COLORS.primary }]}>{formatPrice(order?.total)}</Text>
                </View>
                <View style={styles.cardRow}>
                    <Text style={styles.cardLabel}>Payment</Text>
                    <Text style={styles.cardVal}>{order?.payment_method?.toUpperCase()}</Text>
                </View>
            </View>

            {/* Rate experience */}
            <View style={styles.rateSection}>
                <Text style={styles.rateTitle}>Rate your experience</Text>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(s => (
                        <TouchableOpacity key={s}>
                            <Text style={styles.star}>⭐</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <Button
                title="Continue Shopping"
                onPress={() => navigation.navigate('HomeTab')}
                size="lg"
                style={styles.btn}
            />
            <Button
                title="View Order Details"
                variant="outline"
                onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { orderId: order?.id } })}
                size="lg"
                style={styles.btn}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: SIZES.xl, alignItems: 'center' },
    successCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.xl },
    successEmoji: { fontSize: 60 },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.gray900, marginBottom: SIZES.sm, textAlign: 'center' },
    subtitle: { fontSize: 15, color: COLORS.gray500, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.xl },
    card: { width: '100%', backgroundColor: COLORS.gray50, borderRadius: RADIUS.xl, padding: SIZES.lg, marginBottom: SIZES.xl, borderWidth: 1, borderColor: COLORS.border },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
    cardLabel: { fontSize: 14, color: COLORS.gray500 },
    cardVal: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
    rateSection: { marginBottom: SIZES.xl, alignItems: 'center' },
    rateTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray700, marginBottom: SIZES.md },
    stars: { flexDirection: 'row', gap: SIZES.md },
    star: { fontSize: 32 },
    btn: { width: '100%', marginBottom: SIZES.sm },
})