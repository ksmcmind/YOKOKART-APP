// src/components/common/LoginPrompt.jsx
// Bottom sheet modal shown when guest tries to add to cart or access orders
import { View, Text, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { COLORS, RADIUS, SIZES, SHADOW } from '../../utils/constants'
import Button from './Button'

export default function LoginPrompt({ visible, onClose, reason = 'cart' }) {
    const navigation = useNavigation()

    const config = {
        cart: { icon: '🛒', title: 'Sign in to add items', sub: 'Create an account to save your cart and place orders' },
        orders: { icon: '📦', title: 'Sign in to view orders', sub: 'Track your orders and delivery status after signing in' },
        profile: { icon: '👤', title: 'Sign in to your account', sub: 'Access your profile, addresses and preferences' },
    }
    const c = config[reason] || config.cart

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <View style={styles.sheet}>
                <View style={styles.handle} />

                <Text style={styles.icon}>{c.icon}</Text>
                <Text style={styles.title}>{c.title}</Text>
                <Text style={styles.sub}>{c.sub}</Text>

                <Button
                    title="Sign In / Register"
                    onPress={() => {
                        onClose()
                        setTimeout(() => {
                            navigation.navigate('AuthFlow', { screen: 'Login' })
                        }, 50)
                    }}
                    size="lg"
                    style={styles.btn}
                />

                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Continue Browsing</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SIZES.xl,
        alignItems: 'center',
        paddingBottom: 40,
        ...SHADOW.md,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.gray300, marginBottom: SIZES.xl },
    icon: { fontSize: 56, marginBottom: SIZES.lg },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.gray900, textAlign: 'center', marginBottom: SIZES.sm },
    sub: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', lineHeight: 21, marginBottom: SIZES.xl },
    btn: { width: '100%', marginBottom: SIZES.md },
    cancelBtn: { paddingVertical: SIZES.sm },
    cancelText: { fontSize: 14, color: COLORS.gray400, fontWeight: '600' },
})