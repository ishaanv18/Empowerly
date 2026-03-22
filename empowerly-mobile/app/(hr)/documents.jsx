import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { documentAPI, userAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function HRDocumentsScreen() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [docType, setDocType] = useState('offer');
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ employeeId: '', employeeName: '', position: '', salary: '', startDate: '' });

    const loadData = useCallback(async () => {
        try {
            const res = await documentAPI.getHistory();
            setDocs(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleCreate = async () => {
        if (!form.employeeName || !form.position) {
            Toast.show({ type: 'warning', text1: 'Missing Fields', text2: 'Fill employee name and position' });
            return;
        }
        setCreating(true);
        try {
            if (docType === 'offer') await documentAPI.generateOfferLetter(form);
            else await documentAPI.generateAppointmentLetter(form);
            Toast.show({ type: 'success', text1: '📄 Document Generated!', text2: 'Document is ready' });
            setCreateModal(false);
            setForm({ employeeId: '', employeeName: '', position: '', salary: '', startDate: '' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setCreating(false); }
    };

    const renderDoc = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.row}>
                <View style={styles.iconBox}><Ionicons name="document-text" size={22} color={COLORS.warning} /></View>
                <View style={styles.info}>
                    <Text style={styles.docType}>{item.documentType?.replace('_', ' ')}</Text>
                    <Text style={styles.docEmp}>{item.employeeName}</Text>
                    <Text style={styles.docDate}>{new Date(item.generatedAt || item.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <>
            <ScreenWrapper title="Documents" subtitle="Generated letters" showBack scrollable={false}
                rightAction={<Button title="Generate" size="sm" onPress={() => setCreateModal(true)} icon={<Ionicons name="add" size={14} color="#fff" />} />}>
                <FlatList
                    data={docs}
                    keyExtractor={(item, i) => String(item.id || i)}
                    renderItem={renderDoc}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
                    ListEmptyComponent={!loading && <EmptyState icon="document-outline" title="No Documents" subtitle="Generate offer or appointment letters" />}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>

            <Modal visible={createModal} animationType="slide" transparent onRequestClose={() => setCreateModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.handle} />
                        <Text style={styles.modalTitle}>Generate Document</Text>
                        <View style={styles.typeRow}>
                            {[{ key: 'offer', label: 'Offer Letter' }, { key: 'appointment', label: 'Appointment Letter' }].map((t) => (
                                <Button key={t.key} title={t.label} size="sm" style={{ flex: 1 }}
                                    variant={docType === t.key ? 'primary' : 'outline'}
                                    onPress={() => setDocType(t.key)} />
                            ))}
                        </View>
                        <Input label="Employee Name *" placeholder="John Doe" value={form.employeeName} onChangeText={(t) => setForm({ ...form, employeeName: t })} />
                        <Input label="Position *" placeholder="Software Engineer" value={form.position} onChangeText={(t) => setForm({ ...form, position: t })} />
                        <Input label="Start Date" placeholder="YYYY-MM-DD" value={form.startDate} onChangeText={(t) => setForm({ ...form, startDate: t })} />
                        <Input label="Salary" placeholder="Monthly salary" value={form.salary} onChangeText={(t) => setForm({ ...form, salary: t })} keyboardType="numeric" />
                        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
                            <Button title="Cancel" variant="outline" onPress={() => setCreateModal(false)} style={{ flex: 1 }} />
                            <Button title="Generate" onPress={handleCreate} loading={creating} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,209,102,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    info: { flex: 1 },
    docType: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 },
    docEmp: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 13, marginTop: 2 },
    docDate: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 11, marginTop: 1 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: COLORS.borderLight },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight, alignSelf: 'center', marginBottom: SPACING.lg },
    modalTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginBottom: SPACING.md },
    typeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
});
