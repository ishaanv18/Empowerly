import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { leaveAPI, attendanceAPI, userAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function HRDashboard() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const [leavesRes, usersRes] = await Promise.allSettled([
                leaveAPI.getPending(),
                userAPI.getAllUsers(),
            ]);
            if (leavesRes.status === 'fulfilled') setPendingLeaves(leavesRes.value.data?.slice(0, 5) || []);
            if (usersRes.status === 'fulfilled') setAllUsers(usersRes.value.data || []);
        } catch (e) { }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleLeaveAction = async (leaveId, action) => {
        setActionLoading((p) => ({ ...p, [leaveId]: action }));
        try {
            if (action === 'approve') {
                await leaveAPI.approve(leaveId, 'Approved via mobile app');
                Toast.show({ type: 'success', text1: '✅ Leave Approved', text2: 'Employee has been notified' });
            } else {
                await leaveAPI.reject(leaveId, 'Rejected via mobile app');
                Toast.show({ type: 'info', text1: 'Leave Rejected', text2: 'Employee has been notified' });
            }
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Action Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [leaveId]: null })); }
    };

    const roleCount = (role) => allUsers.filter((u) => u.role === role).length;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>HR Dashboard</Text>
                        <Text style={styles.userName}>{user?.name} 🌟</Text>
                        <Text style={styles.dept}>{user?.department}</Text>
                    </View>
                    <Button title="Logout" variant="ghost" size="sm"
                        icon={<Ionicons name="log-out-outline" size={16} color={COLORS.error} />}
                        textStyle={{ color: COLORS.error }}
                        onPress={() => Alert.alert('Logout', 'Sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}>
                <View style={styles.content}>
                    {/* Stats Grid */}
                    <View style={styles.grid}>
                        <StatCard title="Total Employees" value={allUsers.length} icon={<Ionicons name="people" size={22} color={COLORS.secondary} />}
                            gradient={['rgba(157,78,221,0.2)', 'rgba(108,99,255,0.1)']} style={{ flex: 1, marginRight: SPACING.sm }} />
                        <StatCard title="Pending Leaves" value={pendingLeaves.length} icon={<Ionicons name="time" size={22} color={COLORS.warning} />}
                            gradient={['rgba(255,209,102,0.15)', 'rgba(247,151,30,0.1)']} style={{ flex: 1 }} />
                    </View>
                    <View style={styles.grid}>
                        <StatCard title="HR Staff" value={roleCount('HR')} icon={<Ionicons name="briefcase" size={22} color={COLORS.info} />}
                            gradient={['rgba(79,195,247,0.15)', 'rgba(79,195,247,0.05)']} style={{ flex: 1, marginRight: SPACING.sm }} />
                        <StatCard title="Admin Users" value={roleCount('ADMIN')} icon={<Ionicons name="shield" size={22} color={COLORS.error} />}
                            gradient={['rgba(255,107,107,0.15)', 'rgba(255,107,107,0.05)']} style={{ flex: 1 }} />
                    </View>

                    {/* Pending Leaves */}
                    <Card title="Pending Leave Requests" subtitle={`${pendingLeaves.length} awaiting`}>
                        {pendingLeaves.length === 0 ? (
                            <Text style={styles.emptyText}>No pending leave requests 🎉</Text>
                        ) : (
                            pendingLeaves.map((leave, i) => (
                                <View key={leave.id || i} style={[styles.leaveItem, i < pendingLeaves.length - 1 && styles.leaveItemBorder]}>
                                    <View style={styles.leaveInfo}>
                                        <Text style={styles.leaveName}>{leave.employeeName || leave.userName || 'Employee'}</Text>
                                        <Text style={styles.leaveType}>{leave.leaveType} • {leave.startDate} → {leave.endDate}</Text>
                                        <Text style={styles.leaveReason} numberOfLines={1}>{leave.reason}</Text>
                                    </View>
                                    <View style={styles.leaveActions}>
                                        <Button title="✓" size="sm" variant="secondary"
                                            style={{ backgroundColor: COLORS.successBg, borderColor: COLORS.success, minWidth: 40 }}
                                            textStyle={{ color: COLORS.success }}
                                            loading={actionLoading[leave.id] === 'approve'}
                                            onPress={() => handleLeaveAction(leave.id, 'approve')} />
                                        <Button title="✗" size="sm" variant="danger"
                                            style={{ minWidth: 40 }}
                                            loading={actionLoading[leave.id] === 'reject'}
                                            onPress={() => handleLeaveAction(leave.id, 'reject')} />
                                    </View>
                                </View>
                            ))
                        )}
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
    userName: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginVertical: 2 },
    dept: { color: COLORS.textMuted, fontFamily: FONTS.medium, fontSize: 12 },
    scroll: { flex: 1 },
    content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    grid: { flexDirection: 'row', marginBottom: SPACING.md },
    leaveItem: { paddingVertical: SPACING.sm, flexDirection: 'row', alignItems: 'center' },
    leaveItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    leaveInfo: { flex: 1 },
    leaveName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 },
    leaveType: { color: COLORS.secondary, fontFamily: FONTS.medium, fontSize: 12, marginTop: 2 },
    leaveReason: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 12 },
    leaveActions: { flexDirection: 'row', gap: 6 },
    emptyText: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 14, textAlign: 'center', paddingVertical: SPACING.md },
});
