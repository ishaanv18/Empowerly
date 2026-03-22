import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { payrollAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function HRPayrollScreen() {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ month: '', year: '', payPeriod: '' });
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const res = await payrollAPI.getAllPayrolls();
            setPayrolls(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleCreate = async () => {
        if (!form.month || !form.year) { Toast.show({ type: 'warning', text1: 'Missing Fields', text2: 'Enter month and year' }); return; }
        setCreating(true);
        try {
            const res = await payrollAPI.createPayroll({ month: Number(form.month), year: Number(form.year), payPeriod: form.payPeriod || `${form.year}-${form.month}` });
            await payrollAPI.generateEntries(res.data.id);
            Toast.show({ type: 'success', text1: '✅ Payroll Created!', text2: 'Entries generated successfully' });
            setCreateModal(false);
            setForm({ month: '', year: '', payPeriod: '' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Create Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setCreating(false); }
    };

    const handleSubmit = async (payrollId) => {
        setActionLoading((p) => ({ ...p, [payrollId]: 'submit' }));
        try {
            await payrollAPI.submitForApproval(payrollId);
            Toast.show({ type: 'success', text1: '📤 Submitted!', text2: 'Payroll sent to Admin for approval' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Submit Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [payrollId]: null })); }
    };

    const renderPayroll = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.row}>
                <View style={styles.iconBox}><Ionicons name="wallet" size={22} color={COLORS.secondary} /></View>
                <View style={styles.info}>
                    <Text style={styles.period}>{getMonthName(item.month)} {item.year}</Text>
                    <Text style={styles.entries}>{item.totalEntries || 0} employees</Text>
                </View>
                <Badge status={item.status} />
            </View>
            {item.status === 'DRAFT' && (
                <Button title="Submit for Approval" size="sm" style={{ marginTop: SPACING.sm, alignSelf: 'flex-end' }}
                    loading={actionLoading[item.id] === 'submit'}
                    onPress={() => handleSubmit(item.id)} />
            )}
        </Card>
    );

    return (
        <>
            <ScreenWrapper title="Payroll" subtitle={`${payrolls.length} payroll periods`} scrollable={false}
                rightAction={
                    <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
                        <LinearGradient colors={['#9D4EDD', '#6C63FF']} style={styles.addBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                }>
                <FlatList
                    data={payrolls}
                    keyExtractor={(item, i) => String(item.id || i)}
                    renderItem={renderPayroll}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
                    ListEmptyComponent={!loading && <EmptyState icon="wallet-outline" title="No Payroll Records" subtitle="Create a payroll to get started" action={<Button title="Create Payroll" onPress={() => setCreateModal(true)} size="sm" />} />}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>

            <Modal visible={createModal} animationType="slide" transparent onRequestClose={() => setCreateModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.handle} />
                        <Text style={styles.modalTitle}>Create Payroll</Text>
                        <Input label="Month (1-12)" placeholder="e.g. 3" value={form.month} onChangeText={(t) => setForm({ ...form, month: t })} keyboardType="numeric"
                            icon={<Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />} />
                        <Input label="Year" placeholder="e.g. 2025" value={form.year} onChangeText={(t) => setForm({ ...form, year: t })} keyboardType="numeric"
                            icon={<Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />} />
                        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
                            <Button title="Cancel" variant="outline" onPress={() => setCreateModal(false)} style={{ flex: 1 }} />
                            <Button title="Create & Generate" onPress={handleCreate} loading={creating} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[(month || 1) - 1] || 'N/A';
};

const styles = StyleSheet.create({
    addBtn: { marginLeft: SPACING.sm },
    addBtnGrad: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(157,78,221,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
    info: { flex: 1 },
    period: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    entries: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: COLORS.borderLight },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight, alignSelf: 'center', marginBottom: SPACING.lg },
    modalTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginBottom: SPACING.md },
});
