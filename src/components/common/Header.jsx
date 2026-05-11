// src/components/common/Header.jsx
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../../utils/constants'

export default function Header({ title, onBack, right, subtitle, bg = COLORS.white }) {
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8, backgroundColor: bg }]}>
            <StatusBar barStyle={bg === COLORS.primary ? 'light-content' : 'dark-content'} backgroundColor={bg} />
            <View style={styles.row}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                        <Text style={[styles.backIcon, { color: bg === COLORS.primary ? COLORS.white : COLORS.gray900 }]}>←</Text>
                    </TouchableOpacity>
                ) : <View style={styles.backBtn} />}

                <View style={styles.titleWrap}>
                    <Text style={[styles.title, { color: bg === COLORS.primary ? COLORS.white : COLORS.gray900 }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: bg === COLORS.primary ? 'rgba(255,255,255,0.8)' : COLORS.gray500 }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                <View style={styles.right}>{right || null}</View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 22,
        fontWeight: '600',
    },
    titleWrap: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 1,
    },
    right: {
        width: 40,
        alignItems: 'flex-end',
    },
})