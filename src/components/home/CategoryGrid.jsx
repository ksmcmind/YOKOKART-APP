// src/components/home/CategoryGrid.jsx
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native'
import { COLORS, RADIUS, SIZES, SHADOW } from '../../utils/constants'

export default function CategoryGrid({ categories = [], onPress }) {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, SHADOW.sm]}
            onPress={() => onPress?.(item)}
            activeOpacity={0.8}
        >
            <View style={[
                styles.iconWrap,
                { backgroundColor: item.type === 'service' ? COLORS.accentLight : COLORS.primaryLight }
            ]}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                ) : (
                    <Text style={styles.icon}>{item.icon || '📦'}</Text>
                )}
            </View>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            {item.type === 'service' && (
                <View style={styles.serviceBadge}>
                    <Text style={styles.serviceBadgeText}>Service</Text>
                </View>
            )}
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shop by Category</Text>
            </View>
            <FlatList
                data={categories}
                renderItem={renderItem}
                keyExtractor={item => item.id || item._id || item.slug}
                numColumns={4}
                scrollEnabled={false}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.xl },
    header: { marginBottom: SIZES.md },
    title: { fontSize: 17, fontWeight: '700', color: COLORS.gray900 },
    grid: { gap: SIZES.sm },
    row: { justifyContent: 'space-between' },
    item: {
        flex: 1,
        margin: 4,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SIZES.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconWrap: {
        width: 56, height: 56,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    icon: { fontSize: 28 },
    name: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.gray700,
        textAlign: 'center',
        lineHeight: 14,
    },
    serviceBadge: {
        marginTop: 3,
        backgroundColor: COLORS.accentLight,
        borderRadius: RADIUS.full,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    serviceBadgeText: { fontSize: 9, color: COLORS.accent, fontWeight: '600' },
})