// src/components/home/ProductRow.jsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, SIZES } from '../../utils/constants'
import ProductCard from './ProductCard'

export default function ProductRow({ title, emoji, products = [], onSeeAll, onProductPress }) {
    if (!products.length) return null

    return (
        <View style={styles.section}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.emoji}>{emoji}</Text>
                    <Text style={styles.title}>{title}</Text>
                </View>
                {onSeeAll && (
                    <TouchableOpacity onPress={onSeeAll}>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {products.map((p, i) => (
                    <ProductCard
                        key={p.id || p._id || i}
                        product={p}
                        onPress={() => onProductPress?.(p)}
                    />
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    section: { marginBottom: SIZES.xl },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    emoji: { fontSize: 20 },
    title: { fontSize: 17, fontWeight: '700', color: COLORS.gray900 },
    seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
    scroll: { paddingLeft: SIZES.lg, paddingRight: SIZES.sm },
})