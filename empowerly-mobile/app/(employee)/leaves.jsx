import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { leaveAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID'];

export default function LeavesScreen() {
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [applyModal, setApplyModal] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [form, setForm] = useState({
        leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '',
    });

    const loadData = useCallback(async () => {
        try {
            const [leavesRes, balRes] = await Promise.allSettled([
                leaveAPI.getMyLeaves(),
                leaveAPI.getBalance(),
            ]);
            if (leavesRes.status === 'fulfilled') setLeaves(leavesRes.value.data || []);
            if (balRes.status === 'fulfilled') setBalance(balRes.value.data);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleApply = async () => {
        if (!form.startDate || !form.endDate || !form.reason) {
            Toast.show({ type: 'warning', text1: 'Incomplete Form', text2: 'Fill in all required fields' });
            return;
        }
        setApplyLoading(true);
        try {
            await leaveAPI.apply(form);
            Toast.show({ type: 'success', text1: '✅ Leave Applied!', text2: 'Your request is pending approval' });
            setApplyModal(false);
            setForm({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Apply Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setApplyLoading(false); }
    };

    const handleRevoke = (leaveId) => {
        Alert.alert('Revoke Leave', 'Are you sure you want to revoke this leave?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Revoke', style: 'destructive', onPress: async () => {
                    try {
                        await leaveAPI.revoke(leaveId);
                        Toast.show({ type: 'success', text1: 'Leave Revoked', text2: 'Your request has been revoked' });
                        await loadData();
                    } catch (e) {
                        Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Try again' });
                    }
                }
            }
        ]);
    };

    const renderLeave = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.leaveHeader}>
                <View>
                    <Text style={styles.leaveType}>{item.leaveType} LEAVE</Text>
                    <Text style={styles.leaveDates}>{item.startDate} → {item.endDate}</Text>
                </View>
                <Badge status={item.status} />
            </View>
            <Text style={styles.leaveReason} numberOfLines={2}>{item.reason}</Text>
            {item.status === 'PENDING' && (
                <Button title="Revoke" variant="danger" size="sm"
                    onPress={() => handleRevoke(item.id)}
                    style={{ alignSelf: 'flex-end', marginTop: SPACING.sm }} />
            )}
        </Card>
    );

    return (
        <>
            <ScreenWrapper
                title="My Leaves"
                subtitle={balance ? `Annual: ${balance.annual} | Sick: ${balance.sick} | Casual: ${balance.casual}` : ''}
                noHeader={false}
                scrollable={false}
                rightAction={
                    <TouchableOpacity style={styles.addBtn} onPress={() => setApplyModal(true)}>
                        <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={styles.addBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                }
            >
                <FlatList
                    data={leaves}
                    keyExtractor={(item, i) => String(item.id || i)}
                    renderItem={renderLeave}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    ListEmptyComponent={!loading && (
                        <EmptyState icon="calendar-outline" title="No Leave Requests" subtitle="Tap + to apply for a leave"
                            action={<Button title="Apply Leave" onPress={() => setApplyModal(true)} size="sm" />} />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>

            {/* Apply Modal */}
            <Modal visible={applyModal} animationType="slide" transparent onRequestClose={() => setApplyModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Apply for Leave</Text>

                        <Text style={styles.label}>Leave Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                            {LEAVE_TYPES.map((t) => (
                                <TouchableOpacity key={t} onPress={() => setForm({ ...form, leaveType: t })}
                                    style={[styles.chip, form.leaveType === t && styles.chipActive]}>
                                    <Text style={[styles.chipText, form.leaveType === t && styles.chipTextActive]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Input label="Start Date" placeholder="YYYY-MM-DD" value={form.startDate}
                            onChangeText={(t) => setForm({ ...form, startDate: t })}
                            icon={<Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />} />
                        <Input label="End Date" placeholder="YYYY-MM-DD" value={form.endDate}
                            onChangeText={(t) => setForm({ ...form, endDate: t })}
                            icon={<Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />} />
                        <Input label="Reason" placeholder="Explain your reason..." value={form.reason}
                            onChangeText={(t) => setForm({ ...form, reason: t })} multiline numberOfLines={3} />

                        <View style={styles.modalActions}>
                            <Button title="Cancel" variant="outline" onPress={() => setApplyModal(false)} style={{ flex: 1 }} />
                            <Button title="Submit" onPress={handleApply} loading={applyLoading} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    addBtn: { marginLeft: SPACING.sm },
    addBtnGrad: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    leaveHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.xs },
    leaveType: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 },
    leaveDates: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    leaveReason: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 13 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: {
        backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg, paddingBottom: 40,
        borderTopWidth: 1, borderColor: COLORS.borderLight,
    },
    modalHandle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: COLORS.borderLight, alignSelf: 'center', marginBottom: SPACING.lg,
    },
    modalTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginBottom: SPACING.md },
    label: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 8 },
    chipRow: { marginBottom: SPACING.md },
    chip: {
        paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full,
        borderWidth: 1, borderColor: COLORS.borderLight, marginRight: SPACING.sm, backgroundColor: COLORS.bgCard,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 12 },
    chipTextActive: { color: '#fff' },
    modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
});
