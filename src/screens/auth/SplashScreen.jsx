// src/screens/auth/SplashScreen.jsx
import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet, StatusBar, Platform } from 'react-native'
import { useDispatch } from 'react-redux'
import { initAuth } from '../../store/slices/authSlice'
import { COLORS } from '../../utils/constants'

const isNative = Platform.OS !== 'web'

export default function SplashScreen({ onDone }) {
    const dispatch = useDispatch()
    const scale = useRef(new Animated.Value(0)).current
    const opacity = useRef(new Animated.Value(0)).current
    const slideUp = useRef(new Animated.Value(30)).current

    useEffect(() => {
        // Start animations
        Animated.spring(scale, {
            toValue: 1, friction: 5, tension: 80,
            useNativeDriver: isNative,
        }).start()

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: isNative }),
                Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: isNative }),
            ]).start()
        }, 300)

        // Init auth with timeout safety
        // If initAuth hangs for any reason — still navigate after 2.5s
        const safetyTimer = setTimeout(() => {
            onDone()
        }, 2500)

        dispatch(initAuth()).finally(() => {
            clearTimeout(safetyTimer)
            // Small delay so animation completes
            setTimeout(() => onDone(), 500)
        })

        return () => clearTimeout(safetyTimer)
    }, [])

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <Animated.View style={[styles.logoWrap, { transform: [{ scale }] }]}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>🛒</Text>
                </View>
            </Animated.View>

            <Animated.Text style={[styles.appName, { opacity }]}>
                YOKOKart
            </Animated.Text>

            <Animated.Text style={[
                styles.tagline,
                { opacity, transform: [{ translateY: slideUp }] }
            ]}>
                Delivered to your door
            </Animated.Text>

            <View style={styles.dots}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.dot, { opacity: 0.3 + (i * 0.3) }]} />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrap: { marginBottom: 20 },
    logoCircle: {
        width: 100, height: 100,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    logoEmoji: { fontSize: 52 },
    appName: {
        fontSize: 38,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
    },
    dots: {
        position: 'absolute',
        bottom: 48,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dot: {
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white,
    },
})