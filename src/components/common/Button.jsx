// src/components/common/Button.jsx
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native'
import { COLORS, RADIUS, SIZES } from '../../utils/constants'

export default function Button({
    title, onPress, variant = 'primary', loading = false,
    disabled = false, size = 'md', style, textStyle, icon,
}) {
    const bg = {
        primary: COLORS.primary,
        secondary: COLORS.white,
        accent: COLORS.accent,
        outline: 'transparent',
        danger: '#EF4444',
        ghost: 'transparent',
    }[variant] || COLORS.primary

    const textColor = {
        primary: COLORS.white,
        secondary: COLORS.gray700,
        accent: COLORS.white,
        outline: COLORS.primary,
        danger: COLORS.white,
        ghost: COLORS.primary,
    }[variant] || COLORS.white

    const borderColor = variant === 'outline' ? COLORS.primary :
        variant === 'secondary' ? COLORS.border : 'transparent'

    const pad = size === 'sm' ? { paddingVertical: 8, paddingHorizontal: 16 } :
        size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 24 } :
            { paddingVertical: 13, paddingHorizontal: 20 }

    const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.btn,
                { backgroundColor: bg, borderColor, ...pad, opacity: disabled ? 0.5 : 1 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} size="small" />
            ) : (
                <View style={styles.row}>
                    {icon && <Text style={{ marginRight: 6, fontSize }}>{icon}</Text>}
                    <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontWeight: '600',
        letterSpacing: 0.2,
    },
})