// src/components/common/Skeleton.jsx
// Blinkit-style skeleton loading with shimmer animation

import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, Dimensions } from 'react-native'
import { COLORS, RADIUS } from '../../utils/constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Single shimmer skeleton block
export function SkeletonBox({ width, height, borderRadius = RADIUS.md, style }) {
    const shimmer = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start()
    }, [])

    const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] })

    return (
        <Animated.View
            style={[
                { width, height, borderRadius, backgroundColor: COLORS.gray200, opacity },
                style,
            ]}
        />
    )
}

// ── Product card skeleton ─────────────────────────────────────
export function ProductCardSkeleton({ width = 160 }) {
    return (
        <View style={[styles.productCard, { width }]}>
            <SkeletonBox width="100%" height={120} borderRadius={0} />
            <View style={styles.productInfo}>
                <SkeletonBox width="90%" height={12} style={{ marginBottom: 6 }} />
                <SkeletonBox width="60%" height={10} style={{ marginBottom: 10 }} />
                <View style={styles.priceRow}>
                    <SkeletonBox width={50} height={16} />
                    <SkeletonBox width={44} height={30} borderRadius={6} />
                </View>
            </View>
        </View>
    )
}

// ── Product row skeleton ──────────────────────────────────────
export function ProductRowSkeleton() {
    return (
        <View style={styles.rowSection}>
            <View style={styles.rowHeader}>
                <SkeletonBox width={140} height={18} />
                <SkeletonBox width={50} height={14} />
            </View>
            <View style={styles.rowScroll}>
                {[1, 2, 3].map(i => <ProductCardSkeleton key={i} />)}
            </View>
        </View>
    )
}

// ── Category grid skeleton ────────────────────────────────────
export function CategoryGridSkeleton() {
    return (
        <View style={styles.gridSection}>
            <SkeletonBox width={160} height={18} style={{ marginBottom: 14 }} />
            <View style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <View key={i} style={styles.gridItem}>
                        <SkeletonBox width={56} height={56} borderRadius={RADIUS.md} style={{ marginBottom: 6 }} />
                        <SkeletonBox width={50} height={10} />
                    </View>
                ))}
            </View>
        </View>
    )
}

// ── Banner skeleton ───────────────────────────────────────────
export function BannerSkeleton() {
    return (
        <View style={styles.bannerSection}>
            <SkeletonBox width={SCREEN_WIDTH - 32} height={160} borderRadius={RADIUS.xl} />
        </View>
    )
}

// ── Full home skeleton ────────────────────────────────────────
export function HomeScreenSkeleton() {
    return (
        <View style={styles.homeContainer}>
            {/* Header skeleton */}
            <View style={styles.headerSkeleton}>
                <View style={{ gap: 6 }}>
                    <SkeletonBox width={100} height={11} />
                    <SkeletonBox width={200} height={16} />
                </View>
                <SkeletonBox width={36} height={36} borderRadius={18} />
            </View>

            {/* Search bar skeleton */}
            <View style={styles.searchSkeleton}>
                <SkeletonBox width="100%" height={46} borderRadius={RADIUS.xl} />
            </View>

            {/* ETA badges skeleton */}
            <View style={styles.etaSkeleton}>
                <SkeletonBox width={140} height={28} borderRadius={RADIUS.full} />
                <SkeletonBox width={120} height={28} borderRadius={RADIUS.full} />
            </View>

            {/* Body */}
            <View style={styles.body}>
                <CategoryGridSkeleton />
                <BannerSkeleton />
                <ProductRowSkeleton />
                <ProductRowSkeleton />
            </View>
        </View>
    )
}

// ── List item skeleton ────────────────────────────────────────
export function ListItemSkeleton() {
    return (
        <View style={styles.listItem}>
            <SkeletonBox width={110} height={110} borderRadius={0} />
            <View style={styles.listInfo}>
                <SkeletonBox width="80%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonBox width="50%" height={11} style={{ marginBottom: 8 }} />
                <SkeletonBox width="40%" height={11} style={{ marginBottom: 12 }} />
                <View style={styles.priceRow}>
                    <SkeletonBox width={60} height={18} />
                    <SkeletonBox width={64} height={32} borderRadius={6} />
                </View>
            </View>
        </View>
    )
}

export function ListSkeleton({ count = 6 }) {
    return (
        <View style={{ gap: 8, padding: 16 }}>
            {Array.from({ length: count }).map((_, i) => <ListItemSkeleton key={i} />)}
        </View>
    )
}

const styles = StyleSheet.create({
    // Product card
    productCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
    productInfo: { padding: 12 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    // Row section
    rowSection: { marginBottom: 20 },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
    rowScroll: { flexDirection: 'row', paddingLeft: 16, gap: 12 },

    // Grid
    gridSection: { paddingHorizontal: 16, marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    gridItem: { width: (SCREEN_WIDTH - 64) / 4, alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 8, borderWidth: 1, borderColor: COLORS.border },

    // Banner
    bannerSection: { paddingHorizontal: 16, marginBottom: 20 },

    // Home
    homeContainer: { flex: 1, backgroundColor: COLORS.primary },
    headerSkeleton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 12, opacity: 0.5 },
    searchSkeleton: { paddingHorizontal: 16, paddingBottom: 12, opacity: 0.3 },
    etaSkeleton: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16, opacity: 0.3 },
    body: { flex: 1, backgroundColor: COLORS.background, borderTopLeftRadius: 0, paddingTop: 16 },

    // List
    listItem: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    listInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
})