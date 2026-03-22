import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const MENU_ITEMS = [
    { icon: 'star-outline', label: 'Review Administration', route: '/(admin)/reviews', color: '#FFD166' },
    { icon: 'bar-chart-outline', label: 'Audit Logs', route: '/(admin)/audit-logs', color: '#4FC3F7' },
    { icon: 'cash-outline', label: 'Salary Structures', route: '/(admin)/salary-structures', color: '#38ef7d' },
];

const MenuItem = ({ icon, label, route, color }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => router.push(route)}>
        <View style={[styles.menuIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
);

export default function AdminMoreScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.profile}>
                <LinearGradient colors={['#FF6B6B', '#9D4EDD']} style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
                </LinearGradient>
                <View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <Text style={styles.userRole}>System Administrator 🛡️</Text>
                </View>
            </LinearGradient>
            <ScrollView style={{ flex: 1, padding: SPACING.md }} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Admin Tools</Text>
                <View style={styles.menuGroup}>
                    {MENU_ITEMS.map((item) => <MenuItem key={item.label} {...item} />)}
                </View>
                <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Account</Text>
                <View style={styles.menuGroup}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Logout', 'Exit admin portal?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
                        <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,107,107,0.12)' }]}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                        </View>
                        <Text style={[styles.menuLabel, { color: COLORS.error }]}>Logout</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.version}>Empowerly v1.0.0 • Admin Portal</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    profile: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, paddingVertical: SPACING.lg },
    avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 24 },
    userName: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 18 },
    userEmail: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 13, marginTop: 2 },
    userRole: { color: COLORS.error, fontFamily: FONTS.medium, fontSize: 11, marginTop: 2 },
    sectionTitle: { color: COLORS.textMuted, fontFamily: FONTS.semibold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
    menuGroup: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    menuLabel: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.medium, fontSize: 15 },
    version: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 11, textAlign: 'center', paddingVertical: SPACING.xl },
});
