import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../../utils/constants';

const { width: SW } = Dimensions.get('window');

const LandingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Initial entry
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Breathing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>🛒</Text>
        </View>
        <Text style={styles.appName}>KSMCM</Text>
        <Text style={styles.tagline}>Blink of an eye, right at your door</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700', // Blinkit Yellow
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000', // Black circle logo style
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  logoEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#000',
    marginTop: 8,
    fontWeight: '700',
    opacity: 0.7,
  },
});

export default LandingScreen;
