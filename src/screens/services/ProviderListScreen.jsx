// src/screens/services/ProviderListScreen.jsx
import { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProviders, selectProviders, selectServiceLoading } from '../../store/slices/serviceSlice'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'
import Header from '../../components/common/Header'
import { Loader, EmptyState } from '../../components/common/Helpers'

export default function ProviderListScreen({ route, navigation }) {
    const { category, subcategory } = route.params
    const dispatch = useDispatch()
    const providers = useSelector(selectProviders)
    const loading = useSelector(selectServiceLoading)
    const martId = useSelector(selectMartId)

    useEffect(() => {
        dispatch(fetchProviders({
            martId,
            categorySlug: category.slug,
            subcategorySlug: subcategory?.slug,
        }))
    }, [martId, category.slug, subcategory, dispatch])

    const renderProvider = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, SHADOW.sm]}
            onPress={() => navigation.navigate('ProviderDetail', { provider: item })}
            activeOpacity={0.9}
        >
            {/* Avatar */}
            <View style={styles.avatarWrap}>
                {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={{ fontSize: 32 }}>👤</Text>
                    </View>
                )}
                {item.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Text style={{ fontSize: 12 }}>✓</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.providerInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.star}>⭐</Text>
                        <Text style={styles.rating}>{item.avgRating?.toFixed(1)}</Text>
                        <Text style={styles.reviews}>({item.totalReviews})</Text>
                    </View>
                </View>
                <Text style={styles.subcategory}>{item.subcategoryName || item.categoryName}</Text>

                {/* Details preview */}
                {item.details && Object.entries(item.details).slice(0, 2).map(([k, v]) => (
                    <Text key={k} style={styles.detail}>
                        {k.charAt(0).toUpperCase() + k.slice(1)}: {v}
                    </Text>
                ))}

                {/* Booking types */}
                <View style={styles.typeRow}>
                    {item.bookingTypes?.map(t => (
                        <View key={t} style={styles.typeBadge}>
                            <Text style={styles.typeText}>
                                {t === 'home_visit' ? '🏠 Home' : t === 'video_call' ? '📹 Video' : '🏥 Clinic'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Fee */}
                <View style={styles.feeRow}>
                    <Text style={styles.fee}>{formatPrice(item.consultationFee)}</Text>
                    <Text style={styles.feeLabel}>consultation</Text>
                    <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => navigation.navigate('ProviderDetail', { provider: item })}
                    >
                        <Text style={styles.bookBtnText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header
                title={subcategory?.name || category.name}
                subtitle={`${providers.length} available`}
                onBack={() => navigation.goBack()}
            />
            {loading ? <Loader full /> : providers.length === 0 ? (
                <EmptyState icon="👨‍⚕️" title="No providers available" subtitle="Check back soon!" />
            ) : (
                <FlatList
                    data={providers}
                    keyExtractor={i => i.id}
                    contentContainerStyle={styles.list}
                    renderItem={renderProvider}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    list: { padding: SIZES.lg, gap: SIZES.md, paddingBottom: 100 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SIZES.lg,
        flexDirection: 'row',
        gap: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarWrap: { position: 'relative' },
    avatar: { width: 72, height: 72, borderRadius: 36 },
    avatarPlaceholder: { backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    providerInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    name: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, flex: 1 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
    star: { fontSize: 11 },
    rating: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
    reviews: { fontSize: 10, color: COLORS.gray500 },
    subcategory: { fontSize: 12, color: COLORS.gray500, marginBottom: 4 },
    detail: { fontSize: 12, color: COLORS.gray600, marginBottom: 2 },
    typeRow: { flexDirection: 'row', gap: 6, marginVertical: 6, flexWrap: 'wrap' },
    typeBadge: { backgroundColor: COLORS.gray100, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
    typeText: { fontSize: 11, color: COLORS.gray600 },
    feeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    fee: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
    feeLabel: { fontSize: 11, color: COLORS.gray500, flex: 1 },
    bookBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 8 },
    bookBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
})