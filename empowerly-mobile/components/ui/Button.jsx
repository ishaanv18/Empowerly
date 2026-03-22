import React, { useRef, useEffect } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary | secondary | outline | ghost | danger
    size = 'md',         // sm | md | lg
    loading = false,
    disabled = false,
    icon = null,
    style,
    textStyle,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };
    const onPressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
    };

    const sizeStyles = {
        sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md },
        md: { paddingVertical: 14, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md },
        lg: { paddingVertical: 18, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.lg },
    };
    const textSizes = { sm: 13, md: 15, lg: 17 };

    if (variant === 'primary') {
        return (
            <Animated.View style={[{ transform: [{ scale }] }, style]}>
                <TouchableOpacity
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    onPress={disabled || loading ? null : onPress}
                    activeOpacity={0.9}
                    disabled={disabled || loading}
                >
                    <LinearGradient
                        colors={disabled ? ['#555', '#444'] : ['#6C63FF', '#9D4EDD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.base, sizeStyles[size]]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                {icon}
                                <Text style={[styles.textPrimary, { fontSize: textSizes[size] }, textStyle]}>
                                    {title}
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    const variantMap = {
        secondary: { bg: COLORS.bgCard, border: COLORS.border, text: COLORS.textPrimary },
        outline: { bg: 'transparent', border: COLORS.primary, text: COLORS.primary },
        ghost: { bg: 'transparent', border: 'transparent', text: COLORS.primary },
        danger: { bg: COLORS.errorBg, border: COLORS.error, text: COLORS.error },
    };
    const v = variantMap[variant] || variantMap.secondary;

    return (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={disabled || loading ? null : onPress}
                activeOpacity={0.8}
                disabled={disabled || loading}
                style={[
                    styles.base,
                    sizeStyles[size],
                    { backgroundColor: v.bg, borderColor: v.border, borderWidth: 1 },
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={v.text} size="small" />
                ) : (
                    <>
                        {icon}
                        <Text style={[styles.textVariant, { color: v.text, fontSize: textSizes[size] }, textStyle]}>
                            {title}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    textPrimary: {
        color: '#fff',
        fontFamily: FONTS.semibold,
        letterSpacing: 0.3,
    },
    textVariant: {
        fontFamily: FONTS.semibold,
        letterSpacing: 0.3,
    },
});

export default Button;
