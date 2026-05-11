// src/navigation/AppNavigator.jsx
import { View, Text, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSelector } from 'react-redux'
import { selectCartCount } from '../store/slices/cartSlice'
import { selectIsLoggedIn } from '../store/slices/authSlice'
import { COLORS } from '../utils/constants'
import HomeStack from './HomeStack'
import { CartStack, OrdersStack, ProfileStack } from './stacks'
import { useState } from 'react'
import LoginPrompt from '../components/common/LoginPrompt'

const Tab = createBottomTabNavigator()

const TabIcon = ({ emoji, label, focused, badge }) => (
    <View style={styles.tabItem}>
        <View>
            <Text style={styles.tabEmoji}>{emoji}</Text>
            {badge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
                </View>
            )}
        </View>
        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
        {focused && <View style={styles.tabIndicator} />}
    </View>
)

export default function AppNavigator() {
    const cartCount = useSelector(selectCartCount)
    const isLoggedIn = useSelector(selectIsLoggedIn)
    const [showLogin, setShowLogin] = useState(false)
    const [loginReason, setLoginReason] = useState('cart')

    return (
        <>
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
            />
            <Tab.Screen
                name="CartTab"
                component={CartStack}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" label="Cart" focused={focused} badge={isLoggedIn ? cartCount : 0} /> }}
                listeners={({ navigation }) => ({
                    tabPress: e => {
                        if (!isLoggedIn) {
                            e.preventDefault()
                            setLoginReason('cart')
                            setShowLogin(true)
                        }
                    }
                })}
            />
            <Tab.Screen
                name="OrdersTab"
                component={OrdersStack}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Orders" focused={focused} /> }}
                listeners={({ navigation }) => ({
                    tabPress: e => {
                        if (!isLoggedIn) {
                            e.preventDefault()
                            setLoginReason('orders')
                            setShowLogin(true)
                        }
                    }
                })}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Account" focused={focused} /> }}
                listeners={({ navigation }) => ({
                    tabPress: e => {
                        if (!isLoggedIn) {
                            e.preventDefault()
                            setLoginReason('profile')
                            setShowLogin(true)
                        }
                    }
                })}
            />
        </Tab.Navigator>
        {showLogin && <LoginPrompt visible={showLogin} onClose={() => setShowLogin(false)} reason={loginReason} />}
        </>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        height: 64,
        paddingBottom: 0,
    },
    tabItem: { alignItems: 'center', paddingTop: 8, position: 'relative' },
    tabEmoji: { fontSize: 22 },
    tabLabel: { fontSize: 10, color: COLORS.gray400, marginTop: 2, fontWeight: '500' },
    tabLabelActive: { color: COLORS.primary, fontWeight: '700' },
    tabIndicator: { position: 'absolute', bottom: -8, width: 20, height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
    badge: {
        position: 'absolute', top: -4, right: -8,
        backgroundColor: COLORS.accent,
        borderRadius: 10, minWidth: 18, height: 18,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 3,
    },
    badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
})