import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated, TouchableOpacity,
    KeyboardAvoidingView, TextInput, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const OTP_LENGTH = 6;

export default function OTPScreen() {
    const insets = useSafeAreaInsets();
    const { login } = useAuth();
    const { email } = useLocalSearchParams();

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
        setTimeout(() => inputRefs.current[0]?.focus(), 700);
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOtpChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto-verify when all filled
        if (value && index === OTP_LENGTH - 1 && newOtp.every((d) => d)) {
            setTimeout(() => handleVerify(newOtp.join('')), 100);
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpCode) => {
        const code = otpCode || otp.join('');
        if (code.length < OTP_LENGTH) {
            Toast.show({ type: 'error', text1: 'Incomplete OTP', text2: 'Please enter all 6 digits' });
            return;
        }
        setLoading(true);
        try {
            const response = await authAPI.verifyOTP({ email, otp: code });
            Toast.show({ type: 'success', text1: 'Email Verified! 🎉', text2: 'Welcome to Empowerly' });
            await login(response.data);
        } catch (err) {
            const message = err.response?.data?.error || 'Invalid OTP. Please try again.';
            Toast.show({ type: 'error', text1: 'Verification Failed', text2: message });
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await authAPI.resendOTP(email);
            Toast.show({ type: 'info', text1: 'OTP Sent!', text2: `A new code was sent to ${email}` });
            setResendCooldown(60);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Resend Failed', text2: 'Please try again.' });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0F0C29', '#302b63', '#24243e']} style={styles.gradient}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Animated.View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>

                    {/* Icon */}
                    <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={styles.iconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Ionicons name="mail" size={36} color="#fff" />
                    </LinearGradient>

                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.sub}>
                        We sent a 6-digit code to{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>

                    {/* OTP Inputs */}
                    <View style={styles.otpRow}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[styles.otpCell, digit && styles.otpCellFilled]}
                                value={digit}
                                onChangeText={(v) => handleOtpChange(v.slice(-1), index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectionColor={COLORS.primary}
                            />
                        ))}
                    </View>

                    <Button
                        title={loading ? 'Verifying...' : 'Verify OTP'}
                        onPress={() => handleVerify()}
                        loading={loading}
                        style={styles.verifyBtn}
                        disabled={otp.some((d) => !d)}
                    />

                    {/* Resend */}
                    <View style={styles.resendRow}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        {resendCooldown > 0 ? (
                            <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                                <Text style={styles.resendBtn}>{resendLoading ? 'Sending...' : 'Resend OTP'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: {
        flex: 1, paddingHorizontal: SPACING.lg,
        alignItems: 'center', justifyContent: 'center',
    },
    backBtn: {
        position: 'absolute', top: 60, left: SPACING.lg,
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    iconBox: {
        width: 88, height: 88, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    title: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 28, marginBottom: SPACING.sm },
    sub: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl },
    emailText: { color: COLORS.primary, fontFamily: FONTS.semibold },
    otpRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.xl },
    otpCell: {
        width: 48, height: 56, borderRadius: RADIUS.md,
        backgroundColor: COLORS.bgCard, borderWidth: 1.5,
        borderColor: COLORS.borderLight, color: COLORS.textPrimary,
        fontFamily: FONTS.bold, fontSize: 22,
    },
    otpCellFilled: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
    verifyBtn: { width: '100%', marginBottom: SPACING.lg },
    resendRow: { flexDirection: 'row', alignItems: 'center' },
    resendText: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 14 },
    resendBtn: { color: COLORS.primary, fontFamily: FONTS.semibold, fontSize: 14 },
    cooldownText: { color: COLORS.textMuted, fontFamily: FONTS.medium, fontSize: 14 },
});
