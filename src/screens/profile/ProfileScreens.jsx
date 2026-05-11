// src/screens/profile/ProfileScreens.jsx
import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser, updateUser } from '../../store/slices/authSlice'
import { updateProfile } from '../../api/user.api'
import { COLORS, SIZES, RADIUS } from '../../utils/constants'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'

export default function EditProfileScreen({ navigation }) {
    const dispatch = useDispatch()
    const user = useSelector(selectUser)
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!name.trim()) { Alert.alert('Name is required'); return }
        setSaving(true)
        try {
            const res = await updateProfile({ name, email })
            if (res.success) {
                dispatch(updateUser({ name, email }))
                Alert.alert('Profile updated!', '', [{ text: 'OK', onPress: () => navigation.goBack() }])
            }
        } catch { Alert.alert('Failed to update profile') }
        setSaving(false)
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Edit Profile" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={{ padding: SIZES.lg, gap: SIZES.md }}>
                <View style={styles.fieldWrap}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={COLORS.gray300} />
                </View>
                <View style={styles.fieldWrap}>
                    <Text style={styles.label}>Email (optional)</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" placeholderTextColor={COLORS.gray300} />
                </View>
                <View style={styles.fieldWrap}>
                    <Text style={styles.label}>Phone</Text>
                    <View style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}>
                        <Text style={{ color: COLORS.gray400, fontSize: 15 }}>+91 {user?.phone} (cannot change)</Text>
                    </View>
                </View>
                <Button title="Save Changes" onPress={handleSave} loading={saving} size="lg" style={{ marginTop: SIZES.md }} />
            </ScrollView>
        </View>
    )
}

// ─────────────────────────────────────────────────────────────
// AddressesScreen
import { addAddress, deleteAddress, setDefaultAddr, getAddresses } from '../../api/user.api'

export function AddressesScreen({ navigation }) {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAddresses().then(r => { setAddresses(r.data?.addresses || []); setLoading(false) })
    }, [])

    const handleDelete = (id) => Alert.alert('Delete Address', 'Remove this address?', [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Delete', style: 'destructive', onPress: async () => {
                await deleteAddress(id)
                setAddresses(p => p.filter(a => a.id !== id))
            }
        },
    ])

    const handleDefault = async (id) => {
        await setDefaultAddr(id)
        setAddresses(p => p.map(a => ({ ...a, is_default: a.id === id })))
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="My Addresses" onBack={() => navigation.goBack()} />
            <FlatList
                data={addresses}
                keyExtractor={a => a.id}
                contentContainerStyle={{ padding: SIZES.lg, gap: SIZES.md }}
                ListEmptyComponent={!loading && <EmptyState icon="📍" title="No addresses saved" />}
                renderItem={({ item }) => (
                    <View style={styles.addrCard}>
                        <View style={styles.addrTop}>
                            <Text style={styles.addrType}>{item.type === 'Home' ? '🏠' : item.type === 'Work' ? '💼' : '📍'} {item.type}</Text>
                            {item.is_default && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
                        </View>
                        <Text style={styles.addrText}>{item.name} · {item.phone}</Text>
                        <Text style={styles.addrText}>{item.line1}, {item.city} – {item.pincode}</Text>
                        <View style={styles.addrActions}>
                            {!item.is_default && (
                                <TouchableOpacity onPress={() => handleDefault(item.id)} style={styles.addrBtn}>
                                    <Text style={styles.addrBtnText}>Set Default</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.addrBtn, styles.addrBtnDanger]}>
                                <Text style={[styles.addrBtnText, { color: COLORS.red }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    )
}

// ─────────────────────────────────────────────────────────────
// KycStatusScreen
import { getKycStatus } from '../../api/auth.api'
import { logout } from '../../store/slices/authSlice'

export function KycStatusScreen({ navigation }) {
    const dispatch = useDispatch()
    const [kyc, setKyc] = useState(null)
    const [loading, setLoad] = useState(true)

    useEffect(() => {
        getKycStatus().then(r => { setKyc(r.data); setLoad(false) })
    }, [])

    const STATUS_CONFIG = {
        not_started: { icon: '📋', color: COLORS.gray500, title: 'KYC Not Started', sub: 'Complete verification to unlock all features' },
        pending: { icon: '⏳', color: COLORS.accent, title: 'Under Review', sub: 'Your documents are being verified. Usually takes 24 hours.' },
        verified: { icon: '✅', color: COLORS.primary, title: 'KYC Verified!', sub: 'Your identity has been verified successfully.' },
        rejected: { icon: '❌', color: COLORS.red, title: 'KYC Rejected', sub: kyc?.kycDocuments?.rejectReason || 'Please resubmit your documents.' },
    }
    const cfg = STATUS_CONFIG[kyc?.kycStatus || 'not_started']

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header 
                title="KYC Status" 
                onBack={() => navigation.goBack()} 
                right={
                    <TouchableOpacity onPress={async () => {
                        await dispatch(logout())
                        navigation.navigate('AuthFlow', { screen: 'Login' })
                    }}>
                        <Text style={{ color: COLORS.red, fontWeight: '600' }}>Logout</Text>
                    </TouchableOpacity>
                }
            />
            {loading ? <Loader full /> : (
                <View style={{ padding: SIZES.lg, alignItems: 'center', paddingTop: 60 }}>
                    <Text style={{ fontSize: 72, marginBottom: SIZES.xl }}>{cfg.icon}</Text>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: cfg.color, marginBottom: SIZES.sm }}>{cfg.title}</Text>
                    <Text style={{ fontSize: 15, color: COLORS.gray500, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.xl }}>{cfg.sub}</Text>
                    {/* Document status */}
                    {kyc?.kycDocuments && (
                        <View style={styles.docStatus}>
                            {[
                                { key: 'selfieUrl', label: 'Selfie', icon: '🤳' },
                                { key: 'panUrl', label: 'PAN Card', icon: '🪪' },
                                { key: 'aadhaarUrl', label: 'Aadhaar', icon: '🪪' },
                            ].map(doc => (
                                <View key={doc.key} style={styles.docRow}>
                                    <Text style={styles.docIcon}>{doc.icon}</Text>
                                    <Text style={styles.docLabel}>{doc.label}</Text>
                                    <Text style={{ color: kyc.kycDocuments[doc.key] ? COLORS.primary : COLORS.gray300 }}>
                                        {kyc.kycDocuments[doc.key] ? '✓ Uploaded' : '✗ Missing'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {(kyc?.kycStatus === 'not_started' || kyc?.kycStatus === 'rejected') && (
                        <Button title="Complete KYC →" onPress={() => navigation.navigate('KycSelfie')} size="lg" style={{ width: '100%', marginTop: SIZES.xl }} />
                    )}
                </View>
            )}
        </View>
    )
}

// ─────────────────────────────────────────────────────────────
// SettingsScreen
export function SettingsScreen({ navigation }) {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Header title="Settings" onBack={() => navigation.goBack()} />
            <View style={{ padding: SIZES.lg }}>
                <View style={styles.menuCard}>
                    {[
                        { icon: '🔔', label: 'Push Notifications', sub: 'Order updates, offers' },
                        { icon: '🌐', label: 'Language', sub: 'English' },
                        { icon: '🎨', label: 'Theme', sub: 'Light' },
                        { icon: '🔒', label: 'Privacy Settings' },
                        { icon: '🗑️', label: 'Clear Cache' },
                        { icon: '📋', label: 'Terms of Service' },
                    ].map((item, i) => (
                        <TouchableOpacity key={i} style={[styles.menuItem, i === 5 && { borderBottomWidth: 0 }]}>
                            <Text style={{ fontSize: 20, width: 30 }}>{item.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
                            </View>
                            <Text style={styles.menuChevron}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    )
}

import { useEffect } from 'react'
import { FlatList, TouchableOpacity } from 'react-native'
import { Loader, EmptyState } from '../../components/common/Helpers'

const styles = StyleSheet.create({
    fieldWrap: {},
    label: { fontSize: 13, fontWeight: '600', color: COLORS.gray700, marginBottom: 6 },
    input: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, fontSize: 15, color: COLORS.gray900 },
    addrCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    addrTop: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: 6 },
    addrType: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
    defaultBadge: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
    defaultText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
    addrText: { fontSize: 13, color: COLORS.gray600, lineHeight: 20 },
    addrActions: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.sm },
    addrBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
    addrBtnDanger: { borderColor: COLORS.red },
    addrBtnText: { fontSize: 12, color: COLORS.gray700, fontWeight: '600' },
    docStatus: { width: '100%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border, gap: SIZES.sm },
    docRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
    docIcon: { fontSize: 20 },
    docLabel: { flex: 1, fontSize: 14, color: COLORS.gray700 },
    menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, padding: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
    menuSub: { fontSize: 12, color: COLORS.gray400, marginTop: 1 },
    menuChevron: { fontSize: 20, color: COLORS.gray300 },
})