import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, userAPI, leaveAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { router } from 'expo-router';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const QUICK_ACTIONS = [
    { icon: 'people-outline', label: 'Manage Users', route: '/(admin)/users', color: '#6C63FF' },
    { icon: 'wallet-outline', label: 'Payroll Approval', route: '/(admin)/payroll', color: '#9D4EDD' },
    { icon: 'shield-outline', label: 'Security', route: '/(admin)/security', color: '#FF6B6B' },
    { icon: 'star-outline', label: 'Review Admin', route: '/(admin)/reviews', color: '#FFD166' },
    { icon: 'bar-chart-outline', label: 'Audit Logs', route: '/(admin)/audit-logs', color: '#4FC3F7' },
    { icon: 'cash-outline', label: 'Salary Structures', route: '/(admin)/salary-structures', color: '#38ef7d' },
];

export default function AdminDashboard() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [statsRes, usersRes] = await Promise.allSettled([
                adminAPI.getStats(),
                userAPI.getAllUsers(),
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
        } catch (e) { }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const roleCount = (role) => users.filter((u) => u.role === role).length;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>System Admin</Text>
                        <Text style={styles.userName}>{user?.name} 🛡️</Text>
                    </View>
                    <Button title="Logout" variant="ghost" size="sm"
                        icon={<Ionicons name="log-out-outline" size={16} color={COLORS.error} />}
                        textStyle={{ color: COLORS.error }}
                        onPress={() => Alert.alert('Logout', 'Exit admin portal?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.error} />}>
                <View style={styles.content}>
                    {/* Stats */}
                    <View style={styles.grid}>
                        <StatCard title="Total Users" value={users.length}
                            icon={<Ionicons name="people" size={22} color={COLORS.primary} />}
                            gradient={['rgba(108,99,255,0.2)', 'rgba(108,99,255,0.05)']}
                            style={{ flex: 1, marginRight: SPACING.sm }} />
                        <StatCard title="Employees" value={roleCount('EMPLOYEE')}
                            icon={<Ionicons name="person" size={22} color={COLORS.success} />}
                            gradient={['rgba(56,239,125,0.15)', 'rgba(56,239,125,0.05)']}
                            style={{ flex: 1 }} />
                    </View>
                    <View style={styles.grid}>
                        <StatCard title="HR Staff" value={roleCount('HR')}
                            icon={<Ionicons name="briefcase" size={22} color={COLORS.secondary} />}
                            gradient={['rgba(157,78,221,0.2)', 'rgba(157,78,221,0.05)']}
                            style={{ flex: 1, marginRight: SPACING.sm }} />
                        <StatCard title="Admins" value={roleCount('ADMIN')}
                            icon={<Ionicons name="shield" size={22} color={COLORS.error} />}
                            gradient={['rgba(255,107,107,0.15)', 'rgba(255,107,107,0.05)']}
                            style={{ flex: 1 }} />
                    </View>

                    {/* Quick Actions */}
                    <Card title="Admin Controls">
                        <View style={styles.actionsGrid}>
                            {QUICK_ACTIONS.map((action) => (
                                <View key={action.label} style={styles.actionItem}>
                                    <Button
                                        icon={<Ionicons name={action.icon} size={20} color={action.color} />}
                                        title={action.label}
                                        variant="secondary"
                                        size="sm"
                                        style={{ flexDirection: 'column', height: 70, backgroundColor: action.color + '14', borderColor: action.color + '44' }}
                                        textStyle={{ color: action.color, fontSize: 10, marginTop: 4 }}
                                        onPress={() => router.push(action.route)}
                                    />
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    greeting: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 13 },
    userName: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginTop: 2 },
    scroll: { flex: 1 },
    content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    grid: { flexDirection: 'row', marginBottom: SPACING.md },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    actionItem: { width: '30%' },
});
