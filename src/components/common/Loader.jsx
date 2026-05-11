// src/components/common/Loader.jsx
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS } from '../../utils/constants'

export function Loader({ size = 'large', color = COLORS.primary, full = false }) {
    if (full) return (
        <View style={styles.full}>
            <ActivityIndicator size={size} color={color} />
        </View>
    )
    return <ActivityIndicator size={size} color={color} />
}

const styles = StyleSheet.create({
    full: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: COLORS.background,
    },
})

export default Loader

// ─────────────────────────────────────────────────────────────
// src/components/common/EmptyState.jsx
import { Text } from 'react-native'

export function EmptyState({ icon = '📭', title = 'Nothing here', subtitle, action }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 56, marginBottom: 12 }}>{icon}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 6 }}>
                {title}
            </Text>
            {subtitle && (
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
                    {subtitle}
                </Text>
            )}
            {action && <View style={{ marginTop: 20 }}>{action}</View>}
        </View>
    )
}

// ─────────────────────────────────────────────────────────────
// src/components/common/Badge.jsx
export function Badge({ label, color = COLORS.primary, textColor = '#fff', size = 'md' }) {
    const pad = size === 'sm' ? { paddingHorizontal: 6, paddingVertical: 2 } : { paddingHorizontal: 10, paddingVertical: 4 }
    const font = size === 'sm' ? 10 : 12
    return (
        <View style={[{ backgroundColor: color, borderRadius: 20 }, pad]}>
            <Text style={{ color: textColor, fontSize: font, fontWeight: '600' }}>{label}</Text>
        </View>
    )
}