// src/screens/cart/AddressScreen.jsx
import { useEffect, useState } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'
import { addAddress, getAddresses } from '../../api/user.api'
import { selectUser } from '../../store/slices/authSlice'
import Header from '../../components/common/Header'
import Button from '../../components/common/Button'

const GOOGLE_API_KEY = 'AIzaSyC7gjVyUuiv_LE8aveaFGAlR-w09CAu3NM'

const ADDR_TYPES = ['Home', 'Work', 'Other']

const EMPTY_ADDR = {
    type: 'Home', name: '', phone: '',
    line1: '', line2: '', city: '', pincode: '',
    landmark: '',
}

export default function AddressScreen({ navigation }) {
    const user = useSelector(selectUser)
    const [addresses, setAddresses] = useState([])
    const [selected, setSelected] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_ADDR)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getAddresses().then(r => {
            const addrs = r.data?.data || []
            setAddresses(addrs)
            const def = addrs.find(a => a.is_default) || addrs[0]
            if (def) setSelected(def)
            if (addrs.length === 0) setShowForm(true)
        }).catch(() => {
            setShowForm(true)
        })
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const geocodeAddress = async (addressQuery) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${GOOGLE_API_KEY}`
        const response = await axios.get(url)
        const data = response.data
        if (data?.status === 'OK' && data.results?.length > 0) {
            return data.results[0].geometry.location
        }
        throw new Error(data?.error_message || 'Unable to resolve address location')
    }

    const handleSave = async () => {
        if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) {
            Alert.alert('Please fill all required fields')
            return
        }

        setSaving(true)
        try {
            let location = null
            try {
                const addressQuery = [form.line1, form.line2, form.city, form.pincode].filter(Boolean).join(', ')
                location = await geocodeAddress(addressQuery)
            } catch (geoError) {
                console.warn('Geocoding failed, saving address without coordinates:', geoError.message)
                // Continue without coordinates if geocoding fails
            }

            const payload = {
                ...form,
                lat: location?.lat || null,
                lng: location?.lng || null
            }
            const res = await addAddress(payload)
            if (res.data?.success) {
                // Get the newly added address (last in the array)
                const addresses = res.data.data || []
                const newAddr = addresses[addresses.length - 1]
                if (newAddr) {
                    setAddresses(addresses)
                    setSelected(newAddr)
                }
                setShowForm(false)
                setForm(EMPTY_ADDR)
            } else {
                Alert.alert('Could not save address', res.data?.message || 'Please try again')
            }
        } catch (err) {
            Alert.alert('Address save failed', err.message || 'Please try again')
        }
        setSaving(false)
    }

    const icons = { Home: '🏠', Work: '💼', Other: '📍' }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                <Header title="Delivery Address" onBack={() => navigation.goBack()} />

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Saved addresses */}
                    {addresses.map(addr => (
                        <TouchableOpacity
                            key={addr.id || addr._id}
                            style={[styles.addrCard, selected?.id === addr.id && styles.addrCardActive]}
                            onPress={() => setSelected(addr)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.addrRadio}>
                                <View style={[styles.radio, selected?.id === addr.id && styles.radioActive]} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={styles.addrHeader}>
                                    <Text style={styles.addrIcon}>{icons[addr.type] || '📍'}</Text>
                                    <Text style={styles.addrType}>{addr.type}</Text>
                                    {addr.is_default && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
                                </View>
                                <Text style={styles.addrName}>{addr.name} · {addr.phone}</Text>
                                <Text style={styles.addrLine}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Text>
                                <Text style={styles.addrLine}>{addr.city} – {addr.pincode}</Text>
                                {addr.landmark && <Text style={styles.addrLandmark}>Near: {addr.landmark}</Text>}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Add new */}
                    {!showForm ? (
                        <TouchableOpacity style={styles.addNew} onPress={() => setShowForm(true)}>
                            <Text style={styles.addNewIcon}>+</Text>
                            <Text style={styles.addNewText}>Add New Address</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.formTitle}>New Address</Text>

                            {/* Type selector */}
                            <View style={styles.typeRow}>
                                {ADDR_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                                        onPress={() => set('type', t)}
                                    >
                                        <Text style={styles.typeIcon}>{icons[t]}</Text>
                                        <Text style={[styles.typeText, form.type === t && styles.typeTextActive]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {[
                                { key: 'name', label: 'Full Name *', placeholder: 'Ravi Kumar' },
                                { key: 'phone', label: 'Phone *', placeholder: '9876543210', keyboard: 'phone-pad' },
                                { key: 'line1', label: 'House/Flat/Block *', placeholder: 'Flat 101, Green Apartments' },
                                { key: 'line2', label: 'Area/Colony', placeholder: 'MVP Colony' },
                                { key: 'city', label: 'City *', placeholder: 'Visakhapatnam' },
                                { key: 'pincode', label: 'Pincode *', placeholder: '530017', keyboard: 'number-pad' },
                                { key: 'landmark', label: 'Landmark', placeholder: 'Near SBI Bank' },
                            ].map(f => (
                                <View key={f.key} style={styles.fieldWrap}>
                                    <Text style={styles.fieldLabel}>{f.label}</Text>
                                    <TextInput
                                        style={styles.fieldInput}
                                        placeholder={f.placeholder}
                                        placeholderTextColor={COLORS.gray300}
                                        value={form[f.key]}
                                        onChangeText={v => set(f.key, v)}
                                        keyboardType={f.keyboard || 'default'}
                                    />
                                </View>
                            ))}

                            <View style={styles.formBtns}>
                                <Button title="Cancel" variant="secondary" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                                <Button title="Save Address" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Continue button */}
                {selected && !showForm && (
                    <View style={styles.bottomBar}>
                        <Button
                            title="Deliver Here →"
                            onPress={() => navigation.navigate('DeliverySlot', { address: selected })}
                            size="lg"
                            style={{ flex: 1 }}
                        />
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    content: { padding: SIZES.lg, gap: SIZES.md, paddingBottom: 100 },
    addrCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 2, borderColor: COLORS.border, flexDirection: 'row', gap: SIZES.md },
    addrCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    addrRadio: { paddingTop: 2 },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray300 },
    radioActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
    addrHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    addrIcon: { fontSize: 16 },
    addrType: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
    defaultBadge: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
    defaultText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
    addrName: { fontSize: 13, color: COLORS.gray700, marginBottom: 2 },
    addrLine: { fontSize: 13, color: COLORS.gray600, lineHeight: 18 },
    addrLandmark: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
    addNew: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.primary },
    addNewIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, textAlign: 'center', lineHeight: 36, fontSize: 22, color: COLORS.primary, fontWeight: '700' },
    addNewText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
    form: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.border },
    formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.gray900, marginBottom: SIZES.lg },
    typeRow: { flexDirection: 'row', gap: SIZES.sm, marginBottom: SIZES.lg },
    typeBtn: { flex: 1, alignItems: 'center', padding: SIZES.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.gray50 },
    typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    typeIcon: { fontSize: 20, marginBottom: 2 },
    typeText: { fontSize: 12, color: COLORS.gray600, fontWeight: '500' },
    typeTextActive: { color: COLORS.primary, fontWeight: '700' },
    fieldWrap: { marginBottom: SIZES.md },
    fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray700, marginBottom: 4 },
    fieldInput: { backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, fontSize: 14, color: COLORS.gray900 },
    formBtns: { flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.md },
    bottomBar: { padding: SIZES.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
})