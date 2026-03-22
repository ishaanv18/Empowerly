import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI, leaveAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const QUICK_ACTIONS = [
    { icon: 'calendar-outline', label: 'Apply Leave', route: '/(employee)/leaves', color: '#6C63FF' },
    { icon: 'star-outline', label: 'My Reviews', route: '/(employee)/reviews', color: '#9D4EDD' },
    { icon: 'wallet-outline', label: 'Payslips', route: '/(employee)/payslips', color: '#38ef7d' },
    { icon: 'bulb-outline', label: 'Skills', route: '/(employee)/skills', color: '#FFD166' },
    { icon: 'flame-outline', label: 'Motivation', route: '/(employee)/motivation', color: '#FF6B6B' },
    { icon: 'chatbubbles-outline', label: 'Chat', route: '/(employee)/chat', color: '#4FC3F7' },
    { icon: 'videocam-outline', label: 'Meetings', route: '/(employee)/meetings', color: '#a18cd1' },
    { icon: 'robot-outline', label: 'AI Chatbot', route: '/(employee)/chatbot', color: '#fda085' },
];

export default function EmployeeDashboard() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();

    const [attendance, setAttendance] = useState(null);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [checkOutLoading, setCheckOutLoading] = useState(false);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [attRes, balRes, leavesRes] = await Promise.allSettled([
                attendanceAPI.getTodayAttendance(),
                leaveAPI.getBalance(),
                leaveAPI.getMyLeaves(),
            ]);
            if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);
            if (balRes.status === 'fulfilled') setLeaveBalance(balRes.value.data);
            if (leavesRes.status === 'fulfilled') setRecentLeaves(leavesRes.value.data?.slice(0, 3) || []);
        } catch (e) { }
    }, []);

    useEffect(() => { loadData(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleCheckIn = async () => {
        setCheckInLoading(true);
        try {
            await attendanceAPI.checkIn();
            Toast.show({ type: 'success', text1: '✅ Checked In!', text2: `Welcome, ${user?.name?.split(' ')[0]}! Have a great day.` });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Check-in Failed', text2: e.response?.data?.message || 'Please try again' });
        } finally { setCheckInLoading(false); }
    };

    const handleCheckOut = async () => {
        Alert.alert('Check Out', 'Are you sure you want to check out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Check Out', style: 'destructive', onPress: async () => {
                    setCheckOutLoading(true);
                    try {
                        await attendanceAPI.checkOut();
                        Toast.show({ type: 'success', text1: '👋 Checked Out!', text2: 'Great work today! See you tomorrow.' });
                        await loadData();
                    } catch (e) {
                        Toast.show({ type: 'error', text1: 'Check-out Failed', text2: e.response?.data?.message || 'Please try again' });
                    } finally { setCheckOutLoading(false); }
                }
            }
        ]);
    };

    const isCheckedIn = attendance?.checkIn && !attendance?.checkOut;
    const isCheckedOut = attendance?.checkIn && attendance?.checkOut;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
                        <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Employee'} 👋</Text>
                        <Text style={styles.userMeta}>{user?.department} • {user?.role}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(employee)/chatbot')}>
                            <Ionicons name="robot-outline" size={22} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => {
                            Alert.alert('Logout', 'Are you sure you want to logout?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Logout', style: 'destructive', onPress: logout },
                            ]);
                        }}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                <View style={styles.content}>
                    {/* Attendance Check-In Card */}
                    <LinearGradient
                        colors={isCheckedOut ? ['#11998e', '#38ef7d'] : isCheckedIn ? ['#f7971e', '#FFD166'] : ['#6C63FF', '#9D4EDD']}
                        style={styles.attendanceCard}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.attendanceInfo}>
                            <Ionicons
                                name={isCheckedOut ? 'checkmark-circle' : isCheckedIn ? 'time' : 'radio-button-off'}
                                size={32}
                                color="#fff"
                            />
                            <View style={{ marginLeft: SPACING.sm }}>
                                <Text style={styles.attendanceStatus}>
                                    {isCheckedOut ? 'Shift Complete' : isCheckedIn ? 'Clocked In' : 'Not Checked In'}
                                </Text>
                                {attendance?.checkIn && (
                                    <Text style={styles.attendanceTime}>
                                        In: {new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {attendance.checkOut && ` • Out: ${new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.attendanceBtns}>
                            {!isCheckedIn && !isCheckedOut && (
                                <Button title="Check In" onPress={handleCheckIn} loading={checkInLoading} variant="secondary"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'transparent' }}
                                    textStyle={{ color: '#fff' }} size="sm" />
                            )}
                            {isCheckedIn && !isCheckedOut && (
                                <Button title="Check Out" onPress={handleCheckOut} loading={checkOutLoading} variant="secondary"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'transparent' }}
                                    textStyle={{ color: '#fff' }} size="sm" />
                            )}
                        </View>
                    </LinearGradient>

                    {/* Stats */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Annual Leave"
                            value={leaveBalance?.annual ?? '—'}
                            subtitle="Days remaining"
                            gradient={['rgba(108,99,255,0.2)', 'rgba(157,78,221,0.1)']}
                            icon={<Ionicons name="calendar" size={22} color={COLORS.primary} />}
                            style={{ flex: 1, marginRight: SPACING.sm }}
                        />
                        <StatCard
                            title="Sick Leave"
                            value={leaveBalance?.sick ?? '—'}
                            subtitle="Days remaining"
                            gradient={['rgba(56,239,125,0.15)', 'rgba(17,153,142,0.1)']}
                            icon={<Ionicons name="medical" size={22} color={COLORS.success} />}
                            style={{ flex: 1 }}
                        />
                    </View>

                    {/* Quick Actions */}
                    <Card title="Quick Actions" style={{ marginBottom: SPACING.md }}>
                        <View style={styles.actionsGrid}>
                            {QUICK_ACTIONS.map((action) => (
                                <TouchableOpacity
                                    key={action.label}
                                    style={styles.actionItem}
                                    onPress={() => router.push(action.route)}
                                >
                                    <View style={[styles.actionIcon, { backgroundColor: action.color + '22' }]}>
                                        <Ionicons name={action.icon} size={22} color={action.color} />
                                    </View>
                                    <Text style={styles.actionLabel}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Recent Leaves */}
                    <Card title="Recent Leave Requests">
                        {recentLeaves.length === 0 ? (
                            <Text style={styles.emptyText}>No recent leave requests</Text>
                        ) : (
                            recentLeaves.map((leave, i) => (
                                <View key={leave.id || i} style={[styles.leaveItem, i < recentLeaves.length - 1 && styles.leaveItemBorder]}>
                                    <View>
                                        <Text style={styles.leaveType}>{leave.leaveType}</Text>
                                        <Text style={styles.leaveDates}>{leave.startDate} → {leave.endDate}</Text>
                                    </View>
                                    <Badge status={leave.status} />
                                </View>
                            ))
                        )}
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
    headerContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    greeting: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 14 },
    userName: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 22, marginVertical: 2 },
    userMeta: { color: COLORS.textMuted, fontFamily: FONTS.medium, fontSize: 12 },
    headerActions: { flexDirection: 'row', gap: SPACING.sm },
    actionBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    scroll: { flex: 1 },
    content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    attendanceCard: {
        borderRadius: RADIUS.lg, padding: SPACING.md,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: SPACING.md,
    },
    attendanceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    attendanceStatus: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
    attendanceTime: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    attendanceBtns: {},
    statsGrid: { flexDirection: 'row', marginBottom: SPACING.md },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    actionItem: { width: '22%', alignItems: 'center', gap: 6 },
    actionIcon: { width: 52, height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 10, textAlign: 'center' },
    leaveItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm },
    leaveItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    leaveType: { color: COLORS.textPrimary, fontFamily: FONTS.medium, fontSize: 14 },
    leaveDates: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    emptyText: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 14, textAlign: 'center', paddingVertical: SPACING.md },
});
