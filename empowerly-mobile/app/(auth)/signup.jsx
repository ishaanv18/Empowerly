import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Animated,
    TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Legal'];
const ROLES = ['EMPLOYEE', 'HR'];

export default function SignupScreen() {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [department, setDepartment] = useState('Engineering');
    const [role, setRole] = useState('EMPLOYEE');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Full name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await authAPI.signup({ name: name.trim(), email: email.trim(), password, department, role });
            Toast.show({ type: 'success', text1: 'Account Created! ✅', text2: 'Check your email for the OTP code' });
            router.push({ pathname: '/(auth)/otp', params: { email: email.trim() } });
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || 'Signup failed. Try again.';
            Toast.show({ type: 'error', text1: 'Signup Failed', text2: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#0F0C29', '#302b63', '#24243e']} style={styles.gradient}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
                        {/* Header */}
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
                        </TouchableOpacity>

                        <View style={styles.topSection}>
                            <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Ionicons name="flash" size={28} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.sub}>Join the Empowerly workspace</Text>
                        </View>

                        <View style={styles.formCard}>
                            <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name}
                                icon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />} />
                            <Input label="Email Address" placeholder="you@company.com" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email}
                                icon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />} />
                            <Input label="Password" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry error={errors.password}
                                icon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />} />
                            <Input label="Confirm Password" placeholder="Repeat password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword}
                                icon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} />} />

                            {/* Department Selector */}
                            <Text style={styles.pickerLabel}>Department</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {DEPARTMENTS.map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        onPress={() => setDepartment(d)}
                                        style={[styles.chip, department === d && styles.chipActive]}
                                    >
                                        <Text style={[styles.chipText, department === d && styles.chipTextActive]}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Role Selector */}
                            <Text style={[styles.pickerLabel, { marginTop: SPACING.md }]}>Role</Text>
                            <View style={styles.roleRow}>
                                {ROLES.map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        onPress={() => setRole(r)}
                                        style={[styles.roleChip, role === r && styles.roleChipActive]}
                                    >
                                        <Ionicons
                                            name={r === 'EMPLOYEE' ? 'person' : 'people'}
                                            size={16}
                                            color={role === r ? '#fff' : COLORS.textSecondary}
                                        />
                                        <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Button title="Create Account" onPress={handleSignup} loading={loading} style={styles.signupBtn} />

                            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
                                <Text style={styles.loginText}>
                                    Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flexGrow: 1, paddingHorizontal: SPACING.lg, gap: SPACING.md },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    topSection: { alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.sm },
    logoBox: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    title: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 24 },
    sub: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 14 },
    formCard: {
        backgroundColor: 'rgba(26, 21, 53, 0.95)',
        borderRadius: RADIUS.xl, padding: SPACING.lg,
        borderWidth: 1, borderColor: COLORS.borderLight,
    },
    pickerLabel: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 8 },
    chipScroll: { marginBottom: SPACING.xs },
    chip: {
        paddingHorizontal: SPACING.md, paddingVertical: 8,
        borderRadius: RADIUS.full, borderWidth: 1,
        borderColor: COLORS.borderLight, marginRight: SPACING.sm,
        backgroundColor: COLORS.bgCard,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 13 },
    chipTextActive: { color: '#fff' },
    roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
    roleChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 12, borderRadius: RADIUS.md,
        borderWidth: 1, borderColor: COLORS.borderLight, backgroundColor: COLORS.bgCard,
    },
    roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    roleChipText: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 14 },
    roleChipTextActive: { color: '#fff' },
    signupBtn: { width: '100%', marginTop: SPACING.lg },
    loginLink: { alignItems: 'center', paddingVertical: SPACING.md },
    loginText: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 14 },
    loginHighlight: { color: COLORS.primary, fontFamily: FONTS.semibold },
});
