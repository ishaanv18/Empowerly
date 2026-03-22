import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { leaveAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function HRLeavesScreen() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const res = await leaveAPI.getAll();
            setLeaves(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleAction = async (leaveId, action) => {
        setActionLoading((p) => ({ ...p, [leaveId]: action }));
        try {
            if (action === 'approve') {
                await leaveAPI.approve(leaveId, 'Approved by HR');
                Toast.show({ type: 'success', text1: '✅ Approved', text2: 'Leave request has been approved' });
            } else {
                await leaveAPI.reject(leaveId, 'Rejected by HR');
                Toast.show({ type: 'info', text1: 'Rejected', text2: 'Leave request has been rejected' });
            }
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [leaveId]: null })); }
    };

    const renderLeave = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.empName}>{item.employeeName || item.userName || 'Employee'}</Text>
                    <Text style={styles.leaveType}>{item.leaveType} LEAVE</Text>
                    <Text style={styles.dates}>{item.startDate} → {item.endDate}</Text>
                    <Text style={styles.reason} numberOfLines={2}>{item.reason}</Text>
                </View>
                <Badge status={item.status} />
            </View>
            {item.status === 'PENDING' && (
                <View style={styles.actions}>
                    <Button title="Approve" size="sm" style={{ flex: 1, backgroundColor: COLORS.successBg, borderColor: COLORS.success }}
                        textStyle={{ color: COLORS.success }} variant="secondary"
                        loading={actionLoading[item.id] === 'approve'}
                        onPress={() => handleAction(item.id, 'approve')} />
                    <Button title="Reject" size="sm" variant="danger" style={{ flex: 1 }}
                        loading={actionLoading[item.id] === 'reject'}
                        onPress={() => handleAction(item.id, 'reject')} />
                </View>
            )}
        </Card>
    );

    return (
        <ScreenWrapper title="Leave Management" subtitle={`${leaves.length} total requests`} scrollable={false}>
            <FlatList
                data={leaves}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderLeave}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
                ListEmptyComponent={!loading && <EmptyState icon="calendar-outline" title="No Leave Requests" subtitle="All leave requests will appear here" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
    empName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    leaveType: { color: COLORS.secondary, fontFamily: FONTS.medium, fontSize: 12, marginTop: 2 },
    dates: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 },
    reason: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
});
