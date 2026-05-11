// src/screens/products/CategoryScreen.jsx
import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, selectProducts, selectProductLoading, selectHasMore } from '../../store/slices/productSlice'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { Loader } from '../../components/common/Helpers'
import { EmptyState } from '../../components/common/Helpers'
import ProductCard from '../../components/home/ProductCard'
import { searchProducts, getSuggestions } from '../../api/product.api'
import SearchSuggestions from '../../components/home/SearchSuggestions'
import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TABLET = SCREEN_WIDTH > 600
const SIDEBAR_WIDTH = 65
const GRID_PADDING = 12
const INTERNAL_GAP = 8
const NUM_COLUMNS = IS_TABLET ? 4 : 2
const CARD_WIDTH = (SCREEN_WIDTH - SIDEBAR_WIDTH - (GRID_PADDING * 2) - (INTERNAL_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS

export default function CategoryScreen({ route, navigation }) {
    const { category } = route.params
    const dispatch = useDispatch()
    const products = useSelector(selectProducts)
    const loading = useSelector(selectProductLoading)
    const hasMore = useSelector(selectHasMore)
    const martId = useSelector(selectMartId)

    const subcategories = Array.from(new Map((category.subcategories || []).map(s => [s.slug, s])).values())
    const [selectedSub, setSelectedSub] = useState(subcategories[0] || null)
    const [offset, setOffset] = useState(0)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [suggestions, setSuggestions] = useState(null)

    useEffect(() => {
        if (!martId) return
        setOffset(0)
        
        // Debounced Suggestions & Search
        if (query.trim().length >= 2) {
            const t = setTimeout(async () => {
                try {
                    const sugRes = await getSuggestions(martId, query)
                    setSuggestions(sugRes.data)
                    const res = await searchProducts(martId, query)
                    setResults(res.data?.data?.products || res.data?.products || [])
                } catch {}
            }, 500)
            return () => clearTimeout(t)
        } else {
            setResults(null)
            setSuggestions(null)
        }

        dispatch(fetchProducts({
            martId,
            categoryId: category.id || category._id,
            subcategorySlug: selectedSub?.slug || null,
            offset: 0,
        }))
    }, [martId, category, selectedSub, query, dispatch])

    const handleSelectSuggestion = (item) => {
        setQuery('')
        setSuggestions(null)
        if (item.type === 'product') {
            navigation.navigate('ProductDetail', { product: item.value })
        } else if (item.type === 'category') {
            navigation.navigate('Category', { category: item.value })
        }
    }

    const displayData = results || products

    const handleLoadMore = () => {
        if (!loading && hasMore && !results) {
            const nextOffset = offset + 20
            setOffset(nextOffset)
            dispatch(fetchProducts({
                martId,
                categoryId: category.id || category._id,
                subcategorySlug: selectedSub?.slug || null,
                offset: nextOffset,
            }))
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white, paddingTop: 30 }}>
            {/* Search Bar at Top (No Header, No Back Btn) */}
            <View style={styles.searchWrap}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search in ${category.name}`}
                        value={query}
                        onChangeText={setQuery}
                        placeholderTextColor="#999"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Text style={{ fontSize: 18, color: '#999' }}>×</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* Suggestions Dropdown */}
                {suggestions && query.length >= 2 && (
                    <View style={styles.suggestionsContainer}>
                        <SearchSuggestions 
                            suggestions={suggestions} 
                            onSelect={handleSelectSuggestion} 
                        />
                    </View>
                )}
            </View>

            <View style={styles.main}>
                {/* Sidebar */}
                <View style={styles.sidebar}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {subcategories.map(sub => (
                            <TouchableOpacity
                                key={sub.slug}
                                style={[
                                    styles.sideItem,
                                    selectedSub?.slug === sub.slug && styles.sideItemActive
                                ]}
                                onPress={() => setSelectedSub(sub)}
                            >
                                <View style={[
                                    styles.sideIconBg,
                                    selectedSub?.slug === sub.slug && styles.sideIconBgActive
                                ]}>
                                    {sub.image ? (
                                        <Image source={{ uri: sub.image }} style={styles.sideImg} />
                                    ) : (
                                        <Text style={{ fontSize: 18 }}>{sub.icon || '🛍️'}</Text>
                                    )}
                                </View>
                                <Text style={[
                                    styles.sideLabel,
                                    selectedSub?.slug === sub.slug && styles.sideLabelActive
                                ]} numberOfLines={2}>
                                    {sub.name}
                                </Text>
                                {selectedSub?.slug === sub.slug && <View style={styles.sideIndicator} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Products Area */}
                <View style={styles.content}>
                    <View style={styles.contentHeader}>
                        <Text style={styles.contentTitle}>{selectedSub?.name || 'Products'}</Text>
                        <Text style={styles.contentCount}>{displayData.length} items</Text>
                    </View>

                    {loading && offset === 0 ? (
                        <Loader full />
                    ) : displayData.length === 0 ? (
                        <EmptyState icon="🛍️" title="No products found" subtitle="Try another search or subcategory" />
                    ) : (
                        <FlatList
                            key={NUM_COLUMNS}
                            data={displayData}
                            keyExtractor={(item, index) => `${item.id || item._id}-${index}`}
                            contentContainerStyle={styles.list}
                            numColumns={NUM_COLUMNS}
                            columnWrapperStyle={styles.columnWrapper}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={hasMore && !results ? <Loader style={{ padding: 20 }} /> : null}
                            renderItem={({ item }) => (
                                <ProductCard
                                    product={item}
                                    width={CARD_WIDTH}
                                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                />
                            )}
                        />
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: { flex: 1, flexDirection: 'row' },
    sidebar: {
        width: SIDEBAR_WIDTH,
        backgroundColor: '#f8f9fa',
        borderRightWidth: 1,
        borderRightColor: '#eee',
    },
    sideItem: {
        paddingVertical: 10,
        paddingHorizontal: 1,
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#f8f9fa',
    },
    sideItemActive: {
        backgroundColor: COLORS.white,
    },
    sideIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        overflow: 'hidden',
    },
    sideIconBgActive: {
        backgroundColor: COLORS.primaryLight,
    },
    sideImg: { width: '100%', height: '100%' },
    sideLabel: {
        fontSize: 8,
        fontWeight: '500',
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 2,
    },
    sideLabelActive: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    sideIndicator: {
        position: 'absolute',
        left: 0,
        top: '25%',
        bottom: '25%',
        width: 3,
        backgroundColor: COLORS.primary,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    content: { flex: 1, backgroundColor: COLORS.white },
    contentHeader: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    contentTitle: { fontSize: 14, fontWeight: '800', color: '#000' },
    contentCount: { fontSize: 11, color: '#999' },
    list: { padding: GRID_PADDING, paddingBottom: 100 },
    columnWrapper: { justifyContent: 'flex-start', gap: INTERNAL_GAP, marginBottom: INTERNAL_GAP },
    searchWrap: { padding: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', zIndex: 100 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, height: 40 },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.gray900 },
    suggestionsContainer: { position: 'absolute', top: 52, left: 12, right: 12, backgroundColor: COLORS.white, borderRadius: 8, ...SHADOW.lg, zIndex: 1000 },
})