// src/screens/kyc/KycScreens.jsx
import { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, RADIUS, SIZES } from '../../utils/constants'
import { takePhoto } from '../../utils/permissions'
import { uploadKycDocument } from '../../api/auth.api'
import Button from '../../components/common/Button'

export default function KycSelfieScreen({ navigation }) {
    const insets = useSafeAreaInsets()
    const [photo, setPhoto] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const handleTakePhoto = async () => {
        const result = await takePhoto()
        if (result) setPhoto(result)
    }

    const handleNext = async () => {
        if (!photo) return
        setUploading(true)
        try {
            const res = await uploadKycDocument('selfie', photo.base64)
            if (res.success) {
                navigation.navigate('KycPan', { selfieUrl: res.data.url })
            } else setError(res.message || 'Upload failed')
        } catch { setError('Upload failed. Try again.') }
        setUploading(false)
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
            {/* Progress */}
            <View style={styles.progress}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={[styles.dot, i === 1 && styles.dotActive, i < 1 && styles.dotDone]} />
                ))}
            </View>

            <Text style={styles.step}>Step 1 of 3</Text>
            <Text style={styles.title}>Take a Selfie</Text>
            <Text style={styles.subtitle}>
                Please take a clear selfie for identity verification.{'\n'}
                Make sure your face is clearly visible.
            </Text>

            {/* Camera preview */}
            <TouchableOpacity style={styles.cameraWrap} onPress={handleTakePhoto} activeOpacity={0.8}>
                {photo ? (
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.cameraIcon}>📷</Text>
                        <Text style={styles.cameraText}>Tap to take selfie</Text>
                        <Text style={styles.cameraHint}>Use front camera</Text>
                    </View>
                )}
            </TouchableOpacity>

            {photo && (
                <TouchableOpacity onPress={handleTakePhoto} style={styles.retake}>
                    <Text style={styles.retakeText}>↺ Retake</Text>
                </TouchableOpacity>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.tips}>
                <Text style={styles.tipsTitle}>Tips:</Text>
                {['Good lighting', 'Face clearly visible', 'No sunglasses', 'Look straight at camera'].map(tip => (
                    <Text key={tip} style={styles.tip}>✓ {tip}</Text>
                ))}
            </View>

            <Button
                title={photo ? 'Next →' : 'Take Selfie'}
                onPress={photo ? handleNext : handleTakePhoto}
                loading={uploading}
                disabled={!photo && false}
                size="lg"
                style={styles.btn}
            />
        </View>
    )
}

// ── KYC PAN Screen ────────────────────────────────────────────
export function KycPanScreen({ route, navigation }) {
    const insets = useSafeAreaInsets()
    const { selfieUrl } = route.params
    const [photo, setPhoto] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const handleTakePhoto = async () => {
        const result = await takePhoto()
        if (result) setPhoto(result)
    }

    const handleNext = async () => {
        if (!photo) return
        setUploading(true)
        try {
            const res = await uploadKycDocument('pan', photo.base64)
            if (res.success) {
                navigation.navigate('KycAadhaar', { selfieUrl, panUrl: res.data.url })
            } else setError(res.message)
        } catch { setError('Upload failed') }
        setUploading(false)
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.progress}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={[styles.dot, i === 2 && styles.dotActive, i < 2 && styles.dotDone]} />
                ))}
            </View>
            <Text style={styles.step}>Step 2 of 3</Text>
            <Text style={styles.title}>PAN Card Photo</Text>
            <Text style={styles.subtitle}>Take a clear photo of your PAN card</Text>

            <TouchableOpacity style={[styles.cameraWrap, styles.cardWrap]} onPress={handleTakePhoto} activeOpacity={0.8}>
                {photo ? (
                    <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.cameraIcon}>🪪</Text>
                        <Text style={styles.cameraText}>Tap to photograph PAN card</Text>
                    </View>
                )}
            </TouchableOpacity>

            {photo && <TouchableOpacity onPress={handleTakePhoto} style={styles.retake}><Text style={styles.retakeText}>↺ Retake</Text></TouchableOpacity>}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.tips}>
                {['All 4 corners visible', 'Card text clearly readable', 'No glare or shadow', 'Card lying flat'].map(tip => (
                    <Text key={tip} style={styles.tip}>✓ {tip}</Text>
                ))}
            </View>

            <Button title={photo ? 'Next →' : 'Take Photo'} onPress={photo ? handleNext : handleTakePhoto} loading={uploading} size="lg" style={styles.btn} />
        </View>
    )
}

// ── KYC Aadhaar Screen ────────────────────────────────────────
export function KycAadhaarScreen({ route, navigation }) {
    const insets = useSafeAreaInsets()
    const { selfieUrl, panUrl } = route.params
    const [photo, setPhoto] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const handleTakePhoto = async () => {
        const result = await takePhoto()
        if (result) setPhoto(result)
    }

    const handleSubmit = async () => {
        if (!photo) return
        setUploading(true)
        try {
            const res = await uploadKycDocument('aadhaar', photo.base64)
            if (res.success) {
                // Submit KYC
                const { submitKyc } = await import('../../api/auth.api')
                await submitKyc({ selfieUrl, panUrl, aadhaarUrl: res.data.url })
                navigation.replace('KycStatus')
            } else setError(res.message)
        } catch { setError('Upload failed') }
        setUploading(false)
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.progress}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={[styles.dot, i === 3 && styles.dotActive, i < 3 && styles.dotDone]} />
                ))}
            </View>
            <Text style={styles.step}>Step 3 of 3</Text>
            <Text style={styles.title}>Aadhaar Card Photo</Text>
            <Text style={styles.subtitle}>Take a clear photo of your Aadhaar card (front side)</Text>

            <TouchableOpacity style={[styles.cameraWrap, styles.cardWrap]} onPress={handleTakePhoto} activeOpacity={0.8}>
                {photo ? (
                    <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.cameraIcon}>🪪</Text>
                        <Text style={styles.cameraText}>Tap to photograph Aadhaar</Text>
                    </View>
                )}
            </TouchableOpacity>

            {photo && <TouchableOpacity onPress={handleTakePhoto} style={styles.retake}><Text style={styles.retakeText}>↺ Retake</Text></TouchableOpacity>}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title={photo ? 'Submit KYC ✓' : 'Take Photo'} onPress={photo ? handleSubmit : handleTakePhoto} loading={uploading} size="lg" style={styles.btn} />
        </View>
    )
}

// ── KYC Status Screen ─────────────────────────────────────────
export function KycStatusScreen({ navigation }) {
    const insets = useSafeAreaInsets()
    return (
        <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, justifyContent: 'center' }]}>
            <View style={styles.statusCard}>
                <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 20 }}>⏳</Text>
                <Text style={styles.statusTitle}>KYC Submitted!</Text>
                <Text style={styles.statusText}>
                    Your documents are under review.{'\n'}
                    You'll be notified within 24 hours.{'\n\n'}
                    You can start browsing while we verify.
                </Text>
                <Button
                    title="Start Shopping →"
                    onPress={() => navigation.replace('HomeTab')}
                    size="lg"
                    style={{ marginTop: 24 }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: SIZES.lg },
    progress: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
    dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: COLORS.gray200 },
    dotActive: { backgroundColor: COLORS.primary },
    dotDone: { backgroundColor: COLORS.green },
    step: { textAlign: 'center', color: COLORS.gray500, fontSize: 13, marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.gray900, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    cameraWrap: {
        height: 260, borderRadius: RADIUS.xl, borderWidth: 2, borderStyle: 'dashed',
        borderColor: COLORS.primary, overflow: 'hidden', marginBottom: 12,
        backgroundColor: COLORS.primaryLight,
    },
    cardWrap: { height: 200 },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    cameraIcon: { fontSize: 48 },
    cameraText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
    cameraHint: { fontSize: 12, color: COLORS.gray500 },
    photo: { width: '100%', height: '100%' },
    retake: { alignSelf: 'center', marginBottom: 12 },
    retakeText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    error: { color: COLORS.red, textAlign: 'center', marginBottom: 12 },
    tips: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SIZES.md, marginBottom: 16 },
    tipsTitle: { fontWeight: '700', color: COLORS.gray700, marginBottom: 6 },
    tip: { fontSize: 13, color: COLORS.gray600, marginBottom: 4 },
    btn: { marginTop: 'auto' },
    statusCard: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.xl, padding: SIZES.xl, alignItems: 'center' },
    statusTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 12, textAlign: 'center' },
    statusText: { fontSize: 15, color: COLORS.gray600, textAlign: 'center', lineHeight: 22 },
})