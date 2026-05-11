// src/screens/services/ProviderDetailScreen.jsx
import { useEffect, useState } from 'react'
import {
    View, Text, ScrollView, StyleSheet, Image,
    TouchableOpacity, Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProviderById, selectSelectedProvider } from '../../store/slices/serviceSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'
import Button from '../../components/common/Button'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ProviderDetailScreen({ route, navigation }) {
    const { provider: routeProvider } = route.params
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const full = useSelector(selectSelectedProvider)
    const provider = full?.id === routeProvider.id ? full : routeProvider

    const [bookingType, setBookingType] = useState(provider.bookingTypes?.[0] || 'home_visit')

    useEffect(() => {
        dispatch(fetchProviderById(routeProvider.id))
    }, [routeProvider.id, dispatch])

    const fee = bookingType === 'home_visit'
        ? (provider.consultationFee || 0) + (provider.homeVisitFee || 0)
        : provider.consultationFee || 0

    const details = provider.details || {}

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            <TouchableOpacity
                style={[styles.backBtn, { top: insets.top + 12 }]}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.hero}>
                    {provider.profileImage ? (
                        <Image source={{ uri: provider.profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={{ fontSize: 60 }}>👤</Text>
                        </View>
                    )}
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroName}>{provider.name}</Text>
                        <Text style={styles.heroSub}>{provider.subcategoryName || provider.categoryName}</Text>
                        <View style={styles.heroStats}>
                            <View style={styles.statBadge}>
                                <Text style={styles.statText}>⭐ {provider.avgRating?.toFixed(1)} ({provider.totalReviews} reviews)</Text>
                            </View>
                            {provider.isVerified && (
                                <View style={[styles.statBadge, { backgroundColor: COLORS.primary }]}>
                                    <Text style={styles.statText}>✓ Verified</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Languages */}
                    {provider.languages?.length > 0 && (
                        <View style={styles.langRow}>
                            <Text style={styles.langIcon}>🗣️</Text>
                            <Text style={styles.langText}>Speaks: {provider.languages.join(', ')}</Text>
                        </View>
                    )}

                    {/* About */}
                    {provider.about && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.about}>{provider.about}</Text>
                        </View>
                    )}

                    {/* Details */}
                    {Object.keys(details).length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Qualifications & Experience</Text>
                            <View style={styles.detailsTable}>
                                {Object.entries(details).map(([k, v]) => (
                                    <View key={k} style={styles.detailRow}>
                                        <Text style={styles.detailKey}>{k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ')}</Text>
                                        <Text style={styles.detailVal}>{v}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Clinic address */}
                    {provider.clinicAddress && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <View style={styles.addressCard}>
                                <Text style={styles.addressIcon}>📍</Text>
                                <Text style={styles.addressText}>{provider.clinicAddress}</Text>
                            </View>
                        </View>
                    )}

                    {/* Booking type selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Consultation Type</Text>
                        <View style={styles.typeRow}>
                            {provider.bookingTypes?.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeBtn, bookingType === t && styles.typeBtnActive]}
                                    onPress={() => setBookingType(t)}
                                >
                                    <Text style={styles.typeIcon}>
                                        {t === 'home_visit' ? '🏠' : t === 'video_call' ? '📹' : '🏥'}
                                    </Text>
                                    <Text style={[styles.typeText, bookingType === t && styles.typeTextActive]}>
                                        {t === 'home_visit' ? 'Home Visit' : t === 'video_call' ? 'Video Call' : 'Clinic'}
                                    </Text>
                                    <Text style={[styles.typeFee, bookingType === t && styles.typeTextActive]}>
                                        {t === 'home_visit' ? formatPrice((provider.consultationFee || 0) + (provider.homeVisitFee || 0)) : formatPrice(provider.consultationFee)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Availability */}
                    {provider.availability?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Availability</Text>
                            <View style={styles.daysRow}>
                                {DAYS.map((day, i) => {
                                    const slot = provider.availability?.find(a => a.day === i && a.is_available)
                                    return (
                                        <View key={day} style={[styles.dayBadge, slot && styles.dayBadgeActive]}>
                                            <Text style={[styles.dayText, slot && styles.dayTextActive]}>{day}</Text>
                                            {slot && <Text style={[styles.dayHours, styles.dayTextActive]}>{slot.start_time}–{slot.end_time}</Text>}
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    )}

                    {/* Reviews */}
                    {provider.reviews?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Reviews ({provider.totalReviews})</Text>
                            {provider.reviews.slice(0, 3).map((r, i) => (
                                <View key={i} style={styles.review}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewName}>{r.user_name || 'User'}</Text>
                                        <Text style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
                                    </View>
                                    {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Book Now bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <View>
                    <Text style={styles.feeLabel}>Consultation Fee</Text>
                    <Text style={styles.fee}>{formatPrice(fee)}</Text>
                </View>
                <Button
                    title="Book Now →"
                    onPress={() => navigation.navigate('BookingConfirm', { provider, bookingType, fee })}
                    style={{ flex: 1 }}
                    size="lg"
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    backBtn: { position: 'absolute', left: 16, zIndex: 10, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', ...SHADOW.sm },
    backIcon: { fontSize: 20, color: COLORS.gray900 },
    hero: { height: 280, position: 'relative' },
    avatar: { width: '100%', height: '100%' },
    avatarPlaceholder: { backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.lg, backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.7))' },
    heroName: { fontSize: 24, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
    heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
    heroStats: { flexDirection: 'row', gap: 8 },
    statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
    statText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
    content: { padding: SIZES.lg },
    langRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.lg, backgroundColor: COLORS.primaryLight, padding: SIZES.md, borderRadius: RADIUS.md },
    langIcon: { fontSize: 18 },
    langText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
    section: { marginBottom: SIZES.xl },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.md },
    about: { fontSize: 14, color: COLORS.gray600, lineHeight: 22 },
    detailsTable: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    detailRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    detailKey: { flex: 1, padding: SIZES.md, backgroundColor: COLORS.gray50, fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
    detailVal: { flex: 1.5, padding: SIZES.md, fontSize: 13, color: COLORS.gray900 },
    addressCard: { flexDirection: 'row', gap: 8, backgroundColor: COLORS.gray50, padding: SIZES.md, borderRadius: RADIUS.md },
    addressIcon: { fontSize: 18 },
    addressText: { flex: 1, fontSize: 14, color: COLORS.gray700, lineHeight: 20 },
    typeRow: { gap: SIZES.sm },
    typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: SIZES.md, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white },
    typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    typeIcon: { fontSize: 20 },
    typeText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.gray700 },
    typeTextActive: { color: COLORS.primary },
    typeFee: { fontSize: 15, fontWeight: '700', color: COLORS.gray900 },
    daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    dayBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md, backgroundColor: COLORS.gray100, alignItems: 'center' },
    dayBadgeActive: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary },
    dayText: { fontSize: 12, color: COLORS.gray500, fontWeight: '600' },
    dayTextActive: { color: COLORS.primary },
    dayHours: { fontSize: 9, marginTop: 2 },
    review: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SIZES.md, marginBottom: SIZES.sm },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    reviewName: { fontSize: 13, fontWeight: '600', color: COLORS.gray900 },
    reviewRating: { fontSize: 12 },
    reviewComment: { fontSize: 13, color: COLORS.gray600, lineHeight: 18 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', gap: SIZES.md, paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
    feeLabel: { fontSize: 11, color: COLORS.gray500 },
    fee: { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
})