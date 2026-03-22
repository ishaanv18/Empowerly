import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

const StatCard = ({ title, value, subtitle, icon, gradient, style }) => {
    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const defaultGradient = gradient || ['rgba(108,99,255,0.2)', 'rgba(157,78,221,0.1)'];

    return (
        <Animated.View style={[{ transform: [{ translateY: slideAnim }], opacity: fadeAnim }, style]}>
            <LinearGradient
                colors={defaultGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.row}>
                    <View style={styles.info}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.value}>{value ?? '—'}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {icon && <View style={styles.iconBox}>{icon}</View>}
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.medium,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    info: { flex: 1 },
    title: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    value: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        fontSize: 28,
        lineHeight: 34,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 12,
        marginTop: 4,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
    },
});

export default StatCard;
