import { useEffect, useState, useCallback, useRef } from 'react'
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    RefreshControl, StatusBar, Dimensions,
    Image, TextInput, FlatList, Keyboard, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, fetchHomeSections, selectCategories, selectSections, selectBanners } from '../../store/slices/productSlice'
import { selectMartId, selectUser, setMartIdAction } from '../../store/slices/authSlice'
import { fetchCart } from '../../store/slices/cartSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { setMartId as saveMartId, storage } from '../../utils/storage'
import { getNearestMart, getSuggestions, getProducts } from '../../api/product.api'
import ProductCard from '../../components/home/ProductCard'
import SearchSuggestions from '../../components/home/SearchSuggestions'
import * as Location from 'expo-location'

import LandingScreen from './LandingScreen'
import LocationErrorView from '../../components/home/LocationErrorView'

const { width: SW } = Dimensions.get('window')

// ── Blinkit-style Header ──────────────────────────────────────
function Header({ locName, onSearchFocus, onSearchChange, query, suggestions, onSelectSuggestion, onLocationPress }) {
    const insets = useSafeAreaInsets()
    const [isFocused, setIsFocused] = useState(false)

    return (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.headerTop}>
                <View style={styles.locContainer}>
                    <Text style={styles.deliveryTime}>Delivery in 10-15 mins</Text>
                    <TouchableOpacity style={styles.locRow} onPress={onLocationPress}>
                        <Text style={styles.locText} numberOfLines={1}>{locName}</Text>
                        <Text style={styles.locArrow}>▾</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <Text style={styles.profileEmoji}>👤</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search "milk"'
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={onSearchChange}
                        onFocus={() => { setIsFocused(true); onSearchFocus() }}
                        onBlur={() => setIsFocused(false)}
                    />
                </View>
                {isFocused && query.length >= 2 && (
                    <SearchSuggestions
                        suggestions={suggestions}
                        onSelect={(item) => {
                            onSelectSuggestion(item);
                            Keyboard.dismiss();
                        }}
                    />
                )}
            </View>
        </View>
    )
}

// ── Main Home Screen ──────────────────────────────────────────
export default function HomeScreen({ navigation }) {
    const dispatch = useDispatch()
    const martId = useSelector(selectMartId)
    const user = useSelector(selectUser)
    const categories = useSelector(selectCategories)
    const sections = useSelector(selectSections)
    const banners = useSelector(selectBanners)

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [locName, setLocName] = useState('Detecting location...')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState(null)
    const [errorType, setErrorType] = useState(null)
    const searchTimer = useRef(null)

    // Pagination for 'All Products'
    const [allProducts, setAllProducts] = useState([])
    const [allProductsOffset, setAllProductsOffset] = useState(0)
    const [hasMoreAll, setHasMoreAll] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const uniqueCategories = Array.from(new Map((categories || []).map(c => [c.id || c.slug, c])).values())
    const uniqueSections = Array.from(new Map((sections || []).map(s => [s.id, s])).values())

    const init = useCallback(async (retry = false) => {
        if (!retry) setLoading(true)
        setErrorType(null)
        setAllProducts([])
        setAllProductsOffset(0)
        setHasMoreAll(true)
        
        try {
            let lat, lng
            const savedLocName = await storage.get('locName')
            if (savedLocName) setLocName(savedLocName)

            const { status } = await Location.requestForegroundPermissionsAsync()
            
            if (status !== 'granted') {
                if (!martId) setErrorType('denied')
                setLoading(false)
                return
            }

            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
            lat = loc.coords.latitude
            lng = loc.coords.longitude
            
            if (!savedLocName) {
                const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
                if (geo?.[0]) {
                    const g = geo[0]
                    const parts = [g.name, g.street, g.subregion, g.city].filter(Boolean)
                    const unique = Array.from(new Set(parts))
                    const finalLoc = unique.join(', ') || 'Unknown Location'
                    setLocName(finalLoc)
                    await storage.set('locName', finalLoc)
                }
            }

            // Only fetch nearest mart if we don't have one or if we are refreshing
            if (!martId || retry) {
                const res = await getNearestMart(lat, lng)
                
                if (!res.data?.success || !res.data.data || res.data.data.length === 0) {
                    setErrorType('no_mart')
                    setLoading(false)
                    return
                }

                const mart = res.data.data[0]
                dispatch(setMartIdAction(mart.id))
                await saveMartId(mart.id)
            }
            
            const currentMartId = martId || (await storage.get('martId'))
            
            await Promise.all([
                dispatch(fetchHomeSections(currentMartId)),
                dispatch(fetchCategories(currentMartId)),
                user && dispatch(fetchCart()),
            ])

            // Load initial 'All Products'
            const prodRes = await getProducts(currentMartId, { limit: 10, offset: 0 })
            if (prodRes.data?.data) {
                setAllProducts(prodRes.data.data)
                setAllProductsOffset(10)
                if (prodRes.data.data.length < 10) setHasMoreAll(false)
            }
            
        } catch (e) {
            console.warn('Init error:', e)
            setErrorType('no_mart')
        } finally {
            setLoading(false)
        }
    }, [dispatch, user])

    useEffect(() => { init() }, [init])

    const fetchMoreProducts = async () => {
        if (loadingMore || !hasMoreAll || !martId) return
        setLoadingMore(true)
        try {
            const res = await getProducts(martId, { limit: 10, offset: allProductsOffset })
            const nextProds = res.data?.data || []
            if (nextProds.length > 0) {
                setAllProducts(prev => [...prev, ...nextProds])
                setAllProductsOffset(prev => prev + 10)
            }
            if (nextProds.length < 10) setHasMoreAll(false)
        } catch (err) {
            console.error('Fetch more error:', err)
        } finally {
            setLoadingMore(false)
        }
    }

    const handleSearchChange = (q) => {
        setSearchQuery(q)
        clearTimeout(searchTimer.current)
        if (q.length < 2) {
            setSuggestions(null)
            return
        }
        searchTimer.current = setTimeout(async () => {
            try {
                const res = await getSuggestions(martId, q)
                // Use res.data.data because the backend sendSuccess wraps it
                setSuggestions(res.data.data || res.data)
            } catch (err) {
                console.error('Suggestion error:', err)
            }
        }, 300)
    }

    const handleSelectSuggestion = (item) => {
        setIsSearchOpen(false)
        setSearchQuery('')
        setSuggestions(null)
        if (item.type === 'product') {
            navigation.navigate('ProductDetail', { product: item.value })
        } else if (item.type === 'category') {
            navigation.navigate('Category', { category: item.value })
        } else {
            navigation.navigate('ProductList', { search: item.value })
        }
    }

    if (loading) return <LandingScreen />

    if (errorType) {
        return (
            <LocationErrorView 
                type={errorType} 
                onRetry={() => init(true)}
                onSelectCity={() => navigation.navigate('CityPicker')} 
            />
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={[styles.header, isSearchOpen && styles.headerSearchOpen, { paddingTop: useSafeAreaInsets().top + 10 }]}>
                {!isSearchOpen && (
                    <View style={styles.headerTop}>
                        <View style={styles.locContainer}>
                            <Text style={styles.deliveryTime}>Delivery in 10-15 mins</Text>
                            <TouchableOpacity style={styles.locRow} onPress={() => navigation.navigate('CityPicker')}>
                                <Text style={styles.locText} numberOfLines={1}>{locName}</Text>
                                <Text style={styles.locArrow}>▾</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.profileBtn}>
                            <Text style={styles.profileEmoji}>👤</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, isSearchOpen && styles.searchBarOpen]}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder='Search "milk"'
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            onFocus={() => setIsSearchOpen(true)}
                        />
                        {isSearchOpen && (
                            <TouchableOpacity onPress={() => { setIsSearchOpen(false); setSearchQuery(''); setSuggestions(null); Keyboard.dismiss(); }}>
                                <Text style={styles.cancelBtn}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {isSearchOpen && (
                <View style={styles.searchOverlay}>
                    <SearchSuggestions
                        suggestions={suggestions}
                        query={searchQuery}
                        onSelect={handleSelectSuggestion}
                    />
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => init(true)} />}
                style={{ flex: 1 }}
                contentContainerStyle={{ opacity: isSearchOpen ? 0 : 1 }}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
                    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200
                    if (isCloseToBottom) fetchMoreProducts()
                }}
                scrollEventThrottle={400}
            >
                {/* ── Banners Carousel ── */}
                {banners?.length > 0 && (
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.bannerContainer}
                    >
                        {banners.map((b, i) => (
                            <TouchableOpacity key={b.id || i} activeOpacity={0.9} style={styles.bannerItem}>
                                <Image source={{ uri: b.imageUrl }} style={styles.bannerImg} resizeMode="cover" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.section}>
                    <View style={styles.catGrid}>
                        {uniqueCategories.slice(0, 8).map(cat => (
                            <TouchableOpacity 
                                key={cat.id || cat.slug} 
                                style={styles.catCard}
                                onPress={() => navigation.navigate('Category', { category: cat })}
                            >
                                <View style={styles.catIconBg}>
                                    <Image source={{ uri: cat.image }} style={styles.catImg} />
                                </View>
                                <Text style={styles.catLabel} numberOfLines={2}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Dynamic Aisle Sections ── */}
                {uniqueSections?.map((section) => (
                    <View key={section.id} style={styles.aisle}>
                        <View style={styles.aisleHeader}>
                            <View>
                                <Text style={styles.aisleTitle}>{section.title}</Text>
                                {section.categoryTitle && <Text style={styles.aisleSub}>{section.categoryTitle}</Text>}
                            </View>
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('ProductList', { 
                                    categorySlug: section.categorySlug, 
                                    subcategorySlug: section.subcategorySlug,
                                    section: section.title
                                })}
                                style={styles.seeAllBtn}
                            >
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={section.products}
                            keyExtractor={p => p.id}
                            contentContainerStyle={styles.aisleScroll}
                            snapToInterval={150 + 12}
                            decelerationRate="fast"
                            renderItem={({ item }) => (
                                <ProductCard 
                                    product={item} 
                                    onPress={() => navigation.navigate('ProductDetail', { product: item })} 
                                />
                            )}
                        />
                    </View>
                ))}

                {/* ── All Products Grid (Infinite Scroll) ── */}
                {allProducts.length > 0 && (
                    <View style={styles.aisle}>
                        <View style={styles.aisleHeader}>
                            <Text style={styles.aisleTitle}>Just for You</Text>
                        </View>
                        <View style={styles.allProductsGrid}>
                            {allProducts.map((p, i) => (
                                <View key={`${p.id}-${i}`} style={styles.gridItem}>
                                    <ProductCard 
                                        product={p} 
                                        width={(SW - 40) / 2}
                                        onPress={() => navigation.navigate('ProductDetail', { product: p })} 
                                    />
                                </View>
                            ))}
                        </View>
                        {loadingMore && <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />}
                    </View>
                )}
                
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerSearchOpen: { borderBottomWidth: 0 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    locContainer: { flex: 1 },
    deliveryTime: { fontSize: 18, fontWeight: '900', color: '#000' },
    locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    locText: { fontSize: 13, color: '#666', maxWidth: '80%' },
    locArrow: { fontSize: 10, color: '#666', marginLeft: 4 },
    profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
    profileEmoji: { fontSize: 20 },
    
    searchContainer: { zIndex: 100 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, height: 45 },
    searchBarOpen: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
    cancelBtn: { marginLeft: 10, color: COLORS.primary, fontWeight: '600' },
    searchOverlay: { position: 'absolute', top: 120, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 90 },

    bannerContainer: { paddingVertical: 12, backgroundColor: '#fff' },
    bannerItem: { width: SW - 32, height: (SW - 32) * 0.45, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#eee' },
    bannerImg: { width: '100%', height: '100%' },

    section: { backgroundColor: '#fff', paddingVertical: 8, marginBottom: 8 },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
    catCard: { width: '25%', padding: 8, alignItems: 'center' },
    catIconBg: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center', marginBottom: 6, ...SHADOW.sm },
    catImg: { width: 50, height: 50, borderRadius: 8 },
    catLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', color: '#333' },

    aisle: { backgroundColor: '#fff', paddingVertical: 16, marginBottom: 8 },
    aisleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
    aisleTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
    aisleSub: { fontSize: 12, color: '#666', marginTop: 1 },
    seeAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f0fdf4' },
    seeAll: { fontSize: 13, fontWeight: '800', color: '#16a34a' },
    aisleScroll: { paddingHorizontal: 16, gap: 12 },

    allProductsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
    gridItem: { marginBottom: 12 },
})