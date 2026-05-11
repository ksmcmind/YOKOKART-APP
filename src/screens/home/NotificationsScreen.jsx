// src/screens/home/NotificationsScreen.jsx
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, SIZES, RADIUS } from '../../utils/constants'
import Header from '../../components/common/Header'
import { timeAgo } from '../../utils/formatters'

const MOCK = [
    { id: '1', title: 'Order Delivered! 🎉', body: 'Your order #A1B2C3D4 has been delivered.', time: new Date(Date.now() - 600000), read: false },
    { id: '2', title: 'Driver Assigned 🚴', body: 'Ravi Kumar is on the way with your order.', time: new Date(Date.now() - 3600000), read: true },
    { id: '3', title: 'Great Deals Today! 🏷️', body: 'Up to 40% off on fresh vegetables.', time: new Date(Date.now() - 86400000), read: true },
]

export default function NotificationsScreen({ navigation }) {
    const insets = useSafeAreaInsets()
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Notifications" onBack={() => navigation.goBack()} />
            <FlatList
                data={MOCK}
                keyExtractor={i => i.id}
                contentContainerStyle={{ padding: SIZES.lg, gap: SIZES.sm }}
                renderItem={({ item }) => (
                    <View style={[styles.card, !item.read && styles.unread]}>
                        {!item.read && <View style={styles.dot} />}
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.body}>{item.body}</Text>
                        <Text style={styles.time}>{timeAgo(item.time)}</Text>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SIZES.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    unread: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    dot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: COLORS.primary,
        position: 'absolute', top: 12, right: 12,
    },
    title: { fontSize: 14, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
    body: { fontSize: 13, color: COLORS.gray600, marginBottom: 6, lineHeight: 18 },
    time: { fontSize: 11, color: COLORS.gray400 },
})