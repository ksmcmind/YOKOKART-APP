// src/screens/auth/OtpScreen.jsx
import { useState, useRef, useEffect } from 'react'
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { verifyOtp, sendOtp, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice'
import { COLORS, RADIUS, SIZES } from '../../utils/constants'
import Button from '../../components/common/Button'
import { getPushToken } from '../../utils/permissions'
export default function OtpScreen({ route, navigation }) {
    const { phone } = route.params
    const dispatch = useDispatch()
    const loading = useSelector(selectAuthLoading)
    const error = useSelector(selectAuthError)
    const insets = useSafeAreaInsets()

    const [otp, setOtp] = useState('')
    const [timer, setTimer] = useState(30)
    const [resending, setResending] = useState(false)
    const inputRef = useRef()

    useEffect(() => {
        inputRef.current?.focus()
        const t = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000)
        return () => clearInterval(t)
    }, [])

    const handleVerify = async () => {
        if (otp.length !== 6) return
        dispatch(clearError())

        let pushToken = null
        try {

            pushToken = await getPushToken()
        } catch (e) { }

        const result = await dispatch(verifyOtp({ phone, otp, pushToken }))
        if (!result.error) {
            const user = result.payload?.user
            const rootNav = navigation.getParent()?.getParent() || navigation.getParent()

            if (!user?.kycStatus || user.kycStatus === 'not_started') {
                rootNav?.navigate('App', {
                    screen: 'ProfileTab',
                    params: { screen: 'KycStatus' },
                })
            } else {
                rootNav?.goBack()
            }
        }
    }

    const handleResend = async () => {
        setResending(true)
        setOtp('')
        await dispatch(sendOtp(phone))
        setTimer(30)
        setResending(false)
    }

    // Auto verify when 6 digits entered
    useEffect(() => {
        if (otp.length === 6) handleVerify()
    }, [otp])

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>

                <View style={styles.logoWrap}>
                    <Text style={styles.emoji}>📱</Text>
                </View>

                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                    Sent to <Text style={styles.phone}>+91 {phone}</Text>
                </Text>

                {/* Hidden input */}
                <TextInput
                    ref={inputRef}
                    value={otp}
                    onChangeText={t => { setOtp(t.replace(/\D/g, '').slice(0, 6)); dispatch(clearError()) }}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.hiddenInput}
                />

                {/* OTP boxes */}
                <TouchableOpacity
                    style={styles.otpRow}
                    onPress={() => inputRef.current?.focus()}
                    activeOpacity={1}
                >
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <View
                            key={i}
                            style={[
                                styles.box,
                                otp.length === i && styles.boxActive,
                                otp.length > i && styles.boxFilled,
                            ]}
                        >
                            <Text style={styles.boxText}>{otp[i] || ''}</Text>
                            {otp.length === i && <View style={styles.cursor} />}
                        </View>
                    ))}
                </TouchableOpacity>

                {error && <Text style={styles.error}>{error}</Text>}

                <Button
                    title="Verify OTP"
                    onPress={handleVerify}
                    disabled={otp.length !== 6}
                    loading={loading}
                    size="lg"
                    style={styles.btn}
                />

                {/* Resend */}
                <View style={styles.resendRow}>
                    <Text style={styles.resendText}>Didn't receive? </Text>
                    {timer > 0 ? (
                        <Text style={styles.timer}>Resend in {timer}s</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend} disabled={resending}>
                            <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.xl,
        alignItems: 'center',
    },
    back: { alignSelf: 'flex-start', padding: SIZES.sm, marginBottom: SIZES.lg },
    backText: { fontSize: 24, color: COLORS.gray700 },
    logoWrap: { marginBottom: SIZES.xl },
    emoji: { fontSize: 64 },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.gray900, marginBottom: 8 },
    subtitle: { fontSize: 14, color: COLORS.gray500, marginBottom: SIZES.xxxl, textAlign: 'center' },
    phone: { fontWeight: '700', color: COLORS.gray900 },
    hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
    otpRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SIZES.xl,
    },
    box: {
        width: 48, height: 56,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderColor: COLORS.gray300,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    boxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
    boxText: { fontSize: 22, fontWeight: '700', color: COLORS.gray900 },
    cursor: {
        position: 'absolute',
        bottom: 8,
        width: 2, height: 22,
        backgroundColor: COLORS.primary,
    },
    error: { color: COLORS.red, fontSize: 13, marginBottom: SIZES.md, alignSelf: 'flex-start' },
    btn: { width: '100%', marginBottom: SIZES.xl },
    resendRow: { flexDirection: 'row', alignItems: 'center' },
    resendText: { fontSize: 14, color: COLORS.gray500 },
    timer: { fontSize: 14, color: COLORS.gray500, fontWeight: '600' },
    resendLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
})