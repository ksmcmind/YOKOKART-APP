import { useEffect, useState } from 'react'
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, ActivityIndicator, Keyboard,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { fetchProducts, selectProducts, selectProductLoading, selectHasMore } from '../../store/slices/productSlice'
import { selectMartId } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { EmptyState } from '../../components/common/Helpers'
import ProductCard from '../../components/home/ProductCard'
import SearchSuggestions from '../../components/home/SearchSuggestions'
import { searchProducts, getSuggestions } from '../../api/product.api'
import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IS_TABLET = SCREEN_WIDTH > 600
const GRID_PADDING = 12
const INTERNAL_GAP = 8
const NUM_COLUMNS = IS_TABLET ? 4 : 2
const CARD_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - (INTERNAL_GAP * (NUM_COLUMNS - 1))) / NUM_COLUMNS

const SORT_OPTIONS = [
    { label: 'Relevance', value: '' },
    { label: 'Price ↑', value: 'price_asc' },
    { label: 'Price ↓', value: 'price_desc' },
    { label: 'Discount', value: 'discount' },
]

export default function ProductListScreen({ route, navigation }) {
    const { category, subcategory, categorySlug, subcategorySlug, section, search: openSearch } = route.params || {}
    const dispatch = useDispatch()
    const insets = useSafeAreaInsets()
    const products = useSelector(selectProducts)
    const loading = useSelector(selectProductLoading)
    const hasMore = useSelector(selectHasMore)
    const martId = useSelector(selectMartId)

    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [suggestions, setSuggestions] = useState(null)
    const [searching, setSearching] = useState(false)
    const [sort, setSort] = useState('')
    const [showSort, setShowSort] = useState(false)
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        if (martId && (category || categorySlug)) {
            setOffset(0)
            dispatch(fetchProducts({
                martId,
                categoryId: category?.id || category?._id || categorySlug,
                subcategorySlug: subcategory?.slug || subcategorySlug,
                offset: 0
            }))
        }
    }, [category, categorySlug, subcategory, subcategorySlug, martId, dispatch])

    const handleLoadMore = () => {
        if (!loading && hasMore && !query) {
            const nextOffset = offset + 20
            setOffset(nextOffset)
            dispatch(fetchProducts({
                martId,
                categoryId: category?.id || category?._id || categorySlug,
                subcategorySlug: subcategory?.slug || subcategorySlug,
                offset: nextOffset
            }))
        }
    }

    // Search & Suggestions handler
    useEffect(() => {
        if (!query.trim()) { setResults([]); setSuggestions(null); return }
        const t = setTimeout(async () => {
            setSearching(true)
            try {
                // Fetch Suggestions
                const sugRes = await getSuggestions(martId, query)
                setSuggestions(sugRes.data?.data || sugRes.data)

                // Fetch Results
                const res = await searchProducts(martId, query)
                setResults(res.data?.data?.products || res.data?.products || [])
            } catch { }
            setSearching(false)
        }, 400)
        return () => clearTimeout(t)
    }, [query, martId])

    const handleSelectSuggestion = (item) => {
        setQuery('')
        setSuggestions(null)
        Keyboard.dismiss()
        if (item.type === 'product') {
            navigation.navigate('ProductDetail', { product: item.value })
        } else if (item.type === 'category') {
            navigation.navigate('Category', { category: item.value })
        }
    }

    const displayData = query ? results : products

    const sorted = [...displayData].sort((a, b) => {
        if (sort === 'price_asc') return a.price - b.price
        if (sort === 'price_desc') return b.price - a.price
        if (sort === 'discount') return (b.mrp - b.price) - (a.mrp - a.price)
        return 0
    })

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            {/* Minimal Header with Compact Search */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <View style={styles.searchRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={section || category?.name || "Search products..."}
                            placeholderTextColor={COLORS.gray400}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus={!!openSearch}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Text style={styles.clearIcon}>×</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => setShowSort(!showSort)} style={styles.sortBtn}>
                        <Text style={styles.sortIcon}>⇅</Text>
                    </TouchableOpacity>
                </View>

                {/* Suggestions Dropdown */}
                {suggestions && query.length >= 2 && (
                    <View style={styles.suggestionsOverlay}>
                        <SearchSuggestions 
                            suggestions={suggestions} 
                            query={query}
                            onSelect={handleSelectSuggestion} 
                        />
                    </View>
                )}
            </View>

            {/* Sort options bar */}
            {showSort && (
                <View style={styles.sortRowUnder}>
                    {SORT_OPTIONS.map(o => (
                        <TouchableOpacity
                            key={o.value}
                            style={[styles.sortChip, sort === o.value && styles.sortChipActive]}
                            onPress={() => { setSort(o.value); setShowSort(false) }}
                        >
                            <Text style={[styles.sortText, sort === o.value && styles.sortTextActive]}>
                                {o.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loading && offset === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            ) : sorted.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title={query ? 'No results found' : 'No products'}
                    subtitle={query ? `No products matching "${query}"` : 'Try a different category'}
                />
            ) : (
                <FlatList
                    key={NUM_COLUMNS}
                    data={sorted}
                    keyExtractor={(i, idx) => `${i.id || i._id}-${idx}`}
                    contentContainerStyle={styles.list}
                    numColumns={NUM_COLUMNS}
                    columnWrapperStyle={styles.columnWrapper}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={hasMore && !query ? <ActivityIndicator style={{ padding: 20 }} /> : null}
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
    )
}

const styles = StyleSheet.create({
    header: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, zIndex: 100 },
    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, gap: 10 },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    backIcon: { fontSize: 24, color: COLORS.gray700 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, paddingHorizontal: 12, height: 40, gap: 8, borderWidth: 1, borderColor: COLORS.border },
    searchIcon: { fontSize: 14, color: COLORS.gray400 },
    searchInput: { flex: 1, fontSize: 14, color: COLORS.gray900, fontWeight: '500' },
    clearIcon: { fontSize: 20, color: COLORS.gray400 },
    sortBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.sm, backgroundColor: COLORS.gray50, borderWidth: 1, borderColor: COLORS.border },
    sortIcon: { fontSize: 18, color: COLORS.gray700 },
    
    suggestionsOverlay: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: COLORS.white, ...SHADOW.lg, zIndex: 1000 },
    
    sortRowUnder: { flexDirection: 'row', gap: 8, padding: SIZES.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexWrap: 'wrap' },
    sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.gray100, borderWidth: 1, borderColor: COLORS.border },
    sortChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    sortText: { fontSize: 12, color: COLORS.gray700, fontWeight: '500' },
    sortTextActive: { color: COLORS.white, fontWeight: '700' },
    
    list: { padding: GRID_PADDING, paddingBottom: 100 },
    columnWrapper: { justifyContent: 'flex-start', gap: INTERNAL_GAP, marginBottom: INTERNAL_GAP },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})