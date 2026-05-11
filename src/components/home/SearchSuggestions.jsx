import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, RADIUS } from '../../utils/constants';

const { height: SH } = Dimensions.get('window');

const SearchSuggestions = ({ suggestions, onSelect, query }) => {
  const hasResults = suggestions && (
    (suggestions.products?.length || 0) + 
    (suggestions.categories?.length || 0) + 
    (suggestions.keywords?.length || 0)
  ) > 0;

  if (!query || query.length < 2) return null;

  if (!hasResults) {
    return (
      <View style={styles.overlay}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
          <Text style={styles.emptySub}>Try searching for something else</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Keywords - Flipkart Style */}
        {suggestions.keywords?.map((kw, i) => (
          <TouchableOpacity
            key={`kw-${i}`}
            style={styles.item}
            onPress={() => onSelect({ type: 'keyword', value: kw })}
          >
            <Text style={styles.itemIcon}>🔍</Text>
            <Text style={styles.itemText} numberOfLines={1}>{kw}</Text>
            <Text style={styles.arrowIcon}>↗️</Text>
          </TouchableOpacity>
        ))}

        {/* Categories - "Search in Category" */}
        {suggestions.categories?.map((cat, i) => (
          <TouchableOpacity
            key={`cat-${i}`}
            style={styles.item}
            onPress={() => onSelect({ type: 'category', value: cat })}
          >
            <Text style={styles.itemIcon}>📁</Text>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemText} numberOfLines={1}>{query}</Text>
                <Text style={styles.catHint}>in <Text style={{ color: COLORS.primary }}>{cat.name}</Text></Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Products - Direct navigation */}
        {suggestions.products?.map((prod, i) => (
          <TouchableOpacity
            key={`prod-${i}`}
            style={styles.item}
            onPress={() => onSelect({ type: 'product', value: prod })}
          >
            <Image
              source={{ uri: prod.image }}
              style={styles.prodThumb}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
                <Text style={styles.itemText} numberOfLines={1}>{prod.name}</Text>
                <Text style={styles.prodMeta}>{prod.brand || 'Product'} • ₹{prod.price}</Text>
            </View>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: COLORS.white,
    maxHeight: SH * 0.5,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  itemIcon: {
    fontSize: 16,
    color: '#999',
    width: 20,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  catHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  prodThumb: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  prodMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#ccc',
  },
  empty: { padding: 30, alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#999' },
});

export default SearchSuggestions;
