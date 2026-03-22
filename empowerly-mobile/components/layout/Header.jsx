import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const Header = ({ title, subtitle, showBack = false, rightAction, style }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 8 }, style]}>
            <View style={styles.row}>
                {showBack && (
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                )}
                <View style={styles.titleArea}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
                </View>
                {rightAction && <View style={styles.right}>{rightAction}</View>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLORS.bg,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    titleArea: { flex: 1 },
    title: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        fontSize: 20,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 13,
        marginTop: 2,
    },
    right: {
        marginLeft: SPACING.sm,
    },
});

export default Header;
