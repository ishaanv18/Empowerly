import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const EmptyState = ({ icon = 'file-tray-outline', title = 'No data found', subtitle, action }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {action && <View style={styles.action}>{action}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
        paddingHorizontal: SPACING.xl,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.04)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.semibold,
        fontSize: 16,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    action: {
        marginTop: SPACING.lg,
    },
});

export default EmptyState;
