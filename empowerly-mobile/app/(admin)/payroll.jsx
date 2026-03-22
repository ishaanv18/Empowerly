import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { payrollAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function AdminPayrollScreen() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const res = await payrollAPI.getAllPayrolls();
            const submitted = (res.data || []).filter((p) => p.status === 'SUBMITTED');
            setPayrolls(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleAction = async (payrollId, action) => {
        setActionLoading((p) => ({ ...p, [payrollId]: action }));
        try {
            if (action === 'approve') {
                await payrollAPI.approvePayroll(payrollId, { remarks: 'Approved by Admin' });
                Toast.show({ type: 'success', text1: '✅ Payroll Approved!', text2: 'Employees will be notified' });
            } else {
                await payrollAPI.rejectPayroll(payrollId, { remarks: 'Rejected by Admin' });
                Toast.show({ type: 'info', text1: 'Payroll Rejected', text2: 'HR has been notified' });
            }
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [payrollId]: null })); }
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[(month || 1) - 1] || 'N/A';
    };

    const renderPayroll = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.period}>{getMonthName(item.month)} {item.year}</Text>
                    <Text style={styles.entries}>{item.totalEntries || 0} employees</Text>
                </View>
                <Badge status={item.status} />
            </View>
            {item.status === 'SUBMITTED' && (
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
        <ScreenWrapper title="Payroll Approval" subtitle={`${payrolls.filter(p => p.status === 'SUBMITTED').length} pending`} scrollable={false}>
            <FlatList
                data={payrolls}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderPayroll}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.error} />}
                ListEmptyComponent={!loading && <EmptyState icon="wallet-outline" title="No Payroll Requests" subtitle="Submitted payrolls will appear here" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
    period: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    entries: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    actions: { flexDirection: 'row', gap: SPACING.sm },
});
