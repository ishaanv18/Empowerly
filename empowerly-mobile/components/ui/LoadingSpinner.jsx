import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.spinnerOuter, { transform: [{ rotate: spin }] }]}>
                <View style={styles.spinnerInner} />
            </Animated.View>
            <Animated.Text style={[styles.message, { transform: [{ scale: pulseAnim }] }]}>
                {message}
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bg,
        gap: SPACING.md,
    },
    spinnerOuter: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        borderColor: 'transparent',
        borderTopColor: COLORS.primary,
        borderRightColor: COLORS.secondary,
    },
    spinnerInner: {
        position: 'absolute',
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
        borderRadius: 25,
        backgroundColor: 'rgba(108,99,255,0.1)',
    },
    message: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 14,
        marginTop: SPACING.sm,
    },
});

export default LoadingSpinner;
