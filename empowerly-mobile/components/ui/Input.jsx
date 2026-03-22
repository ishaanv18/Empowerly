import React, { useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    icon,
    error,
    multiline = false,
    numberOfLines = 1,
    style,
}) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const onFocus = () => {
        setFocused(true);
        Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };
    const onBlur = () => {
        setFocused(false);
        Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? COLORS.error : COLORS.borderLight, error ? COLORS.error : COLORS.primary],
    });

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Animated.View style={[styles.inputWrapper, { borderColor }]}>
                {icon && (
                    <View style={styles.iconLeft}>
                        {icon}
                    </View>
                )}
                <TextInput
                    style={[styles.input, icon && styles.inputWithIcon, multiline && styles.multiline]}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.iconRight}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 13,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    iconLeft: {
        paddingLeft: SPACING.md,
    },
    iconRight: {
        paddingRight: SPACING.md,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
        fontSize: 15,
        paddingVertical: 14,
        paddingHorizontal: SPACING.md,
    },
    inputWithIcon: {
        paddingLeft: SPACING.sm,
    },
    multiline: {
        textAlignVertical: 'top',
        paddingTop: SPACING.sm,
        minHeight: 100,
    },
    error: {
        color: COLORS.error,
        fontFamily: FONTS.regular,
        fontSize: 12,
        marginTop: 4,
    },
});

export default Input;
