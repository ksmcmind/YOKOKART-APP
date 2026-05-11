import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES, RADIUS } from '../../utils/constants';

const LocationErrorView = ({ type, onRetry, onSelectCity }) => {
  const isDenied = type === 'denied';

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.emoji}>{isDenied ? '📍' : '😔'}</Text>
      </View>
      
      <Text style={styles.title}>
        {isDenied ? 'Location Permission Denied' : 'No Marts Nearby'}
      </Text>
      
      <Text style={styles.subtitle}>
        {isDenied 
          ? 'We need your location to find the nearest mart and give you the best delivery experience.'
          : "We haven't reached your area yet. We're expanding fast! You can try selecting a different city."}
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={onRetry}>
        <Text style={styles.btnText}>{isDenied ? 'Grant Permission' : 'Try Again'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onSelectCity}>
        <Text style={styles.secondaryBtnText}>Select City Manually</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xxl,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  primaryBtn: {
    backgroundColor: '#3EC70B',
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: '#3EC70B',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LocationErrorView;
