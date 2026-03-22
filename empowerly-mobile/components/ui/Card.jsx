import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

const Card = ({ children, style, title, subtitle, rightAction }) => {
    return (
        <View style={[styles.card, style]}>
            {(title || rightAction) && (
                <View style={styles.header}>
                    <View>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {rightAction}
                </View>
            )}
            {children}
        </View>
    );
};

const GradientCard = ({ children, style, colors }) => {
    // We avoid expo-linear-gradient in card to keep it optional; use border instead
    return (
        <View style={[styles.gradientCard, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
    },
    gradientCard: {
        backgroundColor: COLORS.bgCardAlt,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    title: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.semibold,
        fontSize: 16,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 12,
        marginTop: 2,
    },
});

export { Card, GradientCard };
export default Card;
