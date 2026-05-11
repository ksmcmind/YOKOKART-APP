import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { setMartIdAction } from '../../store/slices/authSlice';
import { getNearestMart } from '../../api/product.api';
import * as Location from 'expo-location';
import { COLORS, SIZES, RADIUS } from '../../utils/constants';
import Header from '../../components/common/Header';
import { storage } from '../../utils/storage';
import axios from 'axios';

// Replace with your Google API Key
const GOOGLE_API_KEY = 'AIzaSyC7gjVyUuiv_LE8aveaFGAlR-w09CAu3NM';

// Helper to generate a unique session token for billing efficiency
const generateSessionToken = () => Math.random().toString(36).substring(2, 15);

const CityPickerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionToken, setSessionToken] = useState(generateSessionToken());

  const searchAddress = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // 1. Autocomplete Request
      // location=17.6868,83.2185 & radius=50000 biases results to Visakhapatnam
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&location=17.6868,83.2185&radius=50000&strictbounds=false&components=country:in&sessiontoken=${sessionToken}&key=${GOOGLE_API_KEY}`;

      const response = await axios.get(url);

      if (response.data.status === 'OK') {
        setResults(response.data.predictions);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.warn('Autocomplete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      await storage.remove('locName');
      await fetchNearestMart(latitude, longitude);
    } catch (err) {
      console.warn(err);
      alert('Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearestMart = async (lat, lng) => {
    try {
      const res = await getNearestMart(lat, lng);
      if (res.data?.success && res.data.data?.[0]) {
        const mart = res.data.data[0];
        dispatch(setMartIdAction(mart.id));
        setSessionToken(generateSessionToken());
        navigation.navigate('HomeTab');
      } else {
        alert("Sorry, we don't serve this area yet!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to find nearest mart");
    }
  };

  const selectLocation = async (item) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      // 2. Get Place Details (to get Lat/Lng from the selected place_id)
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=geometry&sessiontoken=${sessionToken}&key=${GOOGLE_API_KEY}`;
      const detailsRes = await axios.get(detailsUrl);

      if (detailsRes.data.status === 'OK') {
        const { lat, lng } = detailsRes.data.result.geometry.location;
        const placeName = item.structured_formatting.main_text;
        await storage.set('locName', placeName);
        await fetchNearestMart(lat, lng);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to get location details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Search Location" onBack={() => navigation.goBack()} />

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search for area, street..."
          value={query}
          onChangeText={searchAddress}
          autoFocus
          placeholderTextColor="#999"
        />
        {loading && <ActivityIndicator color={COLORS.primary} />}
      </View>

      <TouchableOpacity style={styles.currentLocBtn} onPress={handleCurrentLocation}>
        <View style={styles.currentLocIconBg}>
          <Text style={styles.currentLocIcon}>🎯</Text>
        </View>
        <View>
          <Text style={styles.currentLocTitle}>Use current location</Text>
          <Text style={styles.currentLocSub}>Using GPS</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => selectLocation(item)}>
            <View style={styles.pinBg}>
              <Text style={styles.pin}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {item.structured_formatting.main_text}
              </Text>
              <Text style={styles.resultSub} numberOfLines={1}>
                {item.structured_formatting.secondary_text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && query.length > 2 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No results found for "{query}"</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SIZES.lg,
    paddingHorizontal: 12,
    height: 54,
    backgroundColor: '#f5f5f5',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: '#000' },
  list: { paddingHorizontal: SIZES.lg },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pinBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  pin: { fontSize: 18 },
  resultTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  resultSub: { fontSize: 13, color: '#777', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  empty: { color: '#999', fontSize: 14 },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: 16,
  },
  currentLocIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentLocIcon: { fontSize: 18 },
  currentLocTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  currentLocSub: { fontSize: 12, color: '#777', marginTop: 1 },
  divider: { height: 8, backgroundColor: '#f8f8f8', marginVertical: 8 },
});

export default CityPickerScreen;