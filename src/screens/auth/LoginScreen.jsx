// src/screens/auth/LoginScreen.jsx
import { useState } from 'react'
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { sendOtp, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice'
import { COLORS, RADIUS, SIZES } from '../../utils/constants'
import Button from '../../components/common/Button'

export default function LoginScreen({ navigation }) {
    const dispatch = useDispatch()
    const loading = useSelector(selectAuthLoading)
    const error = useSelector(selectAuthError)
    const insets = useSafeAreaInsets()
    const [phone, setPhone] = useState('')

    const handleSend = async () => {
        if (phone.length !== 10) return
        dispatch(clearError())

        try {
            const result = await dispatch(sendOtp(phone))
            unwrapResult(result)
            navigation.push('Otp', { phone })
        } catch (err) {
            // error state is handled by authSlice, no further action needed
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>

                    {/* Logo */}
                    <View style={styles.logoWrap}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoEmoji}>🛒</Text>
                        </View>
                        <Text style={styles.appName}>YOKOKart</Text>
                        <Text style={styles.tagline}>Delivered to your door</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Enter your phone number</Text>
                        <Text style={styles.cardSubtitle}>We'll send you a 6-digit OTP to verify</Text>

                        {/* Phone input */}
                        <View style={styles.inputRow}>
                            <View style={styles.countryCode}>
                                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="9876543210"
                                placeholderTextColor={COLORS.gray300}
                                value={phone}
                                onChangeText={t => { setPhone(t.replace(/\D/g, '').slice(0, 10)); dispatch(clearError()) }}
                                keyboardType="phone-pad"
                                maxLength={10}
                                onSubmitEditing={handleSend}
                                autoFocus
                            />
                        </View>

                        {error && <Text style={styles.error}>{error}</Text>}

                        <Button
                            title="Send OTP"
                            onPress={handleSend}
                            disabled={phone.length !== 10}
                            loading={loading}
                            size="lg"
                            style={styles.btn}
                        />
                    </View>

                    <Text style={styles.terms}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.link}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.link}>Privacy Policy</Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.lg,
        justifyContent: 'center',
    },
    logoWrap: { alignItems: 'center', marginBottom: 40 },
    logoCircle: {
        width: 80, height: 80,
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoEmoji: { fontSize: 40 },
    appName: { fontSize: 32, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.5 },
    tagline: { fontSize: 14, color: COLORS.gray500, marginTop: 4 },

    card: {
        backgroundColor: COLORS.gray50,
        borderRadius: RADIUS.xl,
        padding: SIZES.xl,
        marginBottom: SIZES.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: COLORS.gray500, marginBottom: SIZES.xl },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        overflow: 'hidden',
        marginBottom: SIZES.lg,
    },
    countryCode: {
        paddingHorizontal: SIZES.md,
        paddingVertical: 14,
        backgroundColor: COLORS.primaryLight,
        borderRightWidth: 1,
        borderRightColor: COLORS.primary,
    },
    countryCodeText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
    input: {
        flex: 1,
        fontSize: 18,
        color: COLORS.gray900,
        padding: SIZES.md,
        fontWeight: '600',
        letterSpacing: 2,
    },
    btn: { marginTop: 4 },
    error: { color: COLORS.red, fontSize: 13, marginBottom: SIZES.md },
    terms: { fontSize: 12, color: COLORS.gray500, textAlign: 'center', lineHeight: 18 },
    link: { color: COLORS.primary, fontWeight: '600' },
})