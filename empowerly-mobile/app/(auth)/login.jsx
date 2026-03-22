import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Animations
    const logoAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(40)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
            Animated.timing(formAnim, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
        ]).start();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await authAPI.login({ email: email.trim(), password });
            const data = response.data;
            Toast.show({ type: 'success', text1: 'Welcome back! 👋', text2: `Hello, ${data.name}` });
            await login(data);
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Login failed. Check your credentials.';
            Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0F0C29', '#302b63', '#24243e']} style={styles.gradient}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <Animated.View style={[styles.logoSection, {
                        opacity: fadeAnim,
                        transform: [{ scale: logoAnim }]
                    }]}>
                        <LinearGradient
                            colors={['#6C63FF', '#9D4EDD']}
                            style={styles.logoBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="flash" size={36} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.logoText}>Empowerly</Text>
                        <Text style={styles.logoSub}>Workforce Management Platform</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View style={[styles.formCard, {
                        opacity: fadeAnim,
                        transform: [{ translateY: formAnim }]
                    }]}>
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSub}>Sign in to your account</Text>

                        <Input
                            label="Email Address"
                            placeholder="you@company.com"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            icon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
                            secureTextEntry
                            error={errors.password}
                            icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/signup')}
                            style={styles.signupLink}
                        >
                            <Text style={styles.signupText}>
                                Don't have an account?{' '}
                                <Text style={styles.signupHighlight}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Version */}
                    <Animated.Text style={[styles.version, { opacity: fadeAnim }]}>
                        Version 1.0.0 • Empowerly HR Suite
                    </Animated.Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.lg,
    },
    logoSection: {
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    logoBox: {
        width: 76,
        height: 76,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xs,
    },
    logoText: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        fontSize: 28,
        letterSpacing: -0.5,
    },
    logoSub: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 13,
        textAlign: 'center',
    },
    formCard: {
        width: '100%',
        backgroundColor: 'rgba(26, 21, 53, 0.95)',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    welcomeTitle: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
        fontSize: 24,
        marginBottom: 4,
    },
    welcomeSub: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 14,
        marginBottom: SPACING.lg,
    },
    loginBtn: {
        width: '100%',
        marginTop: SPACING.xs,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.md,
        gap: SPACING.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.borderLight,
    },
    dividerText: {
        color: COLORS.textMuted,
        fontFamily: FONTS.regular,
        fontSize: 13,
    },
    signupLink: {
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    signupText: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 14,
    },
    signupHighlight: {
        color: COLORS.primary,
        fontFamily: FONTS.semibold,
    },
    version: {
        color: COLORS.textMuted,
        fontFamily: FONTS.regular,
        fontSize: 11,
        textAlign: 'center',
    },
});
