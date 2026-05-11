// src/screens/profile/ProfileScreen.jsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { selectUser } from '../../store/slices/authSlice'
import { COLORS, SIZES, RADIUS, SHADOW } from '../../utils/constants'

const MenuItem = ({ icon, label, sub, onPress, danger, badge }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.menuIcon, { backgroundColor: danger ? COLORS.redLight : COLORS.primaryLight }]}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.menuLabel, danger && { color: COLORS.red }]}>{label}</Text>
            {sub && <Text style={styles.menuSub}>{sub}</Text>}
        </View>
        {badge && (
            <View style={[styles.badge, { backgroundColor: badge === 'verified' ? COLORS.primary : COLORS.accent }]}>
                <Text style={styles.badgeText}>{badge}</Text>
            </View>
        )}
        <Text style={[styles.menuChevron, danger && { color: COLORS.red }]}>›</Text>
    </TouchableOpacity>
)

export default function ProfileScreen({ navigation }) {
    const dispatch = useDispatch()
    const user = useSelector(selectUser)
    const insets = useSafeAreaInsets()

    const kycStatus = user?.kycStatus || 'not_started'

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* User card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarWrap}>
                        {user?.avatarUrl ? (
                            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={{ fontSize: 36 }}>👤</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={() => navigation.navigate('EditProfile')}>
                            <Text style={{ fontSize: 14 }}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'YOKOKart User'}</Text>
                    <Text style={styles.userPhone}>{user?.phone ? `+91 ${user.phone}` : ''}</Text>

                    {/* KYC status */}
                    <TouchableOpacity
                        style={[styles.kycBadge, {
                            backgroundColor: kycStatus === 'verified' ? COLORS.primaryLight :
                                kycStatus === 'pending' ? COLORS.accentLight : COLORS.redLight
                        }]}
                        onPress={() => navigation.navigate('KycStatus')}
                    >
                        <Text style={styles.kycIcon}>
                            {kycStatus === 'verified' ? '✅' : kycStatus === 'pending' ? '⏳' : '⚠️'}
                        </Text>
                        <Text style={[styles.kycText, {
                            color: kycStatus === 'verified' ? COLORS.primary :
                                kycStatus === 'pending' ? COLORS.accent : COLORS.red
                        }]}>
                            KYC {kycStatus === 'not_started' ? 'Required' : kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                        </Text>
                        <Text style={styles.kycArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.menuCard}>
                        <MenuItem icon="✏️" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
                        <MenuItem icon="📍" label="My Addresses" sub="Manage delivery addresses" onPress={() => navigation.navigate('Addresses')} />
                        <MenuItem icon="🔔" label="Notifications" onPress={() => { }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity</Text>
                    <View style={styles.menuCard}>
                        <MenuItem icon="📦" label="My Orders" sub="View order history" onPress={() => navigation.navigate('OrderHistory')} />
                        <MenuItem icon="📅" label="My Bookings" sub="Service appointments" onPress={() => navigation.navigate('MyBookings')} />
                        <MenuItem icon="🪪" label="KYC Status" sub="Identity verification" badge={kycStatus === 'verified' ? 'verified' : kycStatus === 'pending' ? 'pending' : null} onPress={() => navigation.navigate('KycStatus')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <View style={styles.menuCard}>
                        <MenuItem icon="⚙️" label="Settings" onPress={() => navigation.navigate('Settings')} />
                        <MenuItem icon="❓" label="Help & Support" onPress={() => { }} />
                        <MenuItem icon="📋" label="Privacy Policy" onPress={() => { }} />
                        <MenuItem icon="🚪" label="Logout" danger onPress={async () => {
                            await dispatch(logout())
                            navigation.navigate('AuthFlow', { screen: 'Login' })
                        }} />
                    </View>
                </View>

                <View style={styles.appVersion}>
                    <Text style={styles.appName}>YOKOKart</Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: SIZES.lg, paddingBottom: SIZES.lg, backgroundColor: COLORS.primary },
    headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white },
    userCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.lg,
        borderRadius: RADIUS.xl,
        padding: SIZES.xl,
        alignItems: 'center',
        ...SHADOW.sm,
    },
    avatarWrap: { position: 'relative', marginBottom: SIZES.md },
    avatar: { width: 90, height: 90, borderRadius: 45 },
    avatarPlaceholder: { backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    userName: { fontSize: 20, fontWeight: '800', color: COLORS.gray900, marginBottom: 4 },
    userPhone: { fontSize: 14, color: COLORS.gray500, marginBottom: SIZES.md },
    kycBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 8 },
    kycIcon: { fontSize: 16 },
    kycText: { fontSize: 13, fontWeight: '700' },
    kycArrow: { fontSize: 16, color: COLORS.gray400, marginLeft: 4 },
    section: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SIZES.sm },
    menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, padding: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    menuIcon: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
    menuSub: { fontSize: 12, color: COLORS.gray400, marginTop: 1 },
    menuChevron: { fontSize: 20, color: COLORS.gray300 },
    badge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
    appVersion: { alignItems: 'center', paddingVertical: SIZES.lg },
    appName: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    versionText: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
})