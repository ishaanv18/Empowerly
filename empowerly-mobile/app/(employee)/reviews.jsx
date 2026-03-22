import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { performanceReviewAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function ReviewsScreen() {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [assessModal, setAssessModal] = useState(false);
    const [assessLoading, setAssessLoading] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [form, setForm] = useState({ achievements: '', challenges: '', goals: '', rating: '' });

    const loadData = useCallback(async () => {
        try {
            const res = await performanceReviewAPI.getAllCycles();
            const publishedCycles = (res.data || []).filter((c) => c.status === 'PUBLISHED');
            setCycles(publishedCycles);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleSelfAssessment = async () => {
        if (!form.achievements || !form.goals || !form.rating) {
            Toast.show({ type: 'warning', text1: 'Incomplete', text2: 'Fill all required fields' });
            return;
        }
        setAssessLoading(true);
        try {
            await performanceReviewAPI.submitSelfAssessment({
                cycleId: selectedCycle?.id,
                ...form,
                selfRating: Number(form.rating),
            });
            Toast.show({ type: 'success', text1: '✅ Self-Assessment Submitted!', text2: 'HR will review your assessment' });
            setAssessModal(false);
            setForm({ achievements: '', challenges: '', goals: '', rating: '' });
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Submit Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setAssessLoading(false); }
    };

    const renderCycle = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.cycleHeader}>
                <View>
                    <Text style={styles.cycleName}>{item.name}</Text>
                    <Text style={styles.cycleDates}>{item.startDate} → {item.endDate}</Text>
                </View>
                <Badge status={item.status} />
            </View>
            {item.description && <Text style={styles.cycleDesc} numberOfLines={2}>{item.description}</Text>}
            <Button
                title="Submit Self-Assessment"
                size="sm"
                style={{ marginTop: SPACING.sm, alignSelf: 'flex-end' }}
                onPress={() => { setSelectedCycle(item); setAssessModal(true); }}
            />
        </Card>
    );

    return (
        <>
            <ScreenWrapper title="Performance" subtitle="Active review cycles" scrollable={false}>
                <FlatList
                    data={cycles}
                    keyExtractor={(item, i) => String(item.id || i)}
                    renderItem={renderCycle}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    ListEmptyComponent={!loading && (
                        <EmptyState icon="star-outline" title="No Active Review Cycles"
                            subtitle="HR will notify you when a review cycle is published" />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>

            <Modal visible={assessModal} animationType="slide" transparent onRequestClose={() => setAssessModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.handle} />
                        <Text style={styles.modalTitle}>Self-Assessment</Text>
                        {selectedCycle && <Text style={styles.cycleName2}>{selectedCycle.name}</Text>}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Input label="Achievements *" placeholder="What did you accomplish?" value={form.achievements}
                                onChangeText={(t) => setForm({ ...form, achievements: t })} multiline numberOfLines={3} />
                            <Input label="Challenges" placeholder="What challenges did you face?" value={form.challenges}
                                onChangeText={(t) => setForm({ ...form, challenges: t })} multiline numberOfLines={3} />
                            <Input label="Goals for Next Period *" placeholder="What are your goals?" value={form.goals}
                                onChangeText={(t) => setForm({ ...form, goals: t })} multiline numberOfLines={3} />
                            <Input label="Self Rating (1-5) *" placeholder="Rate yourself 1-5" value={form.rating}
                                onChangeText={(t) => setForm({ ...form, rating: t })} keyboardType="numeric"
                                icon={<Ionicons name="star-outline" size={18} color={COLORS.textMuted} />} />
                        </ScrollView>
                        <View style={styles.actions}>
                            <Button title="Cancel" variant="outline" onPress={() => setAssessModal(false)} style={{ flex: 1 }} />
                            <Button title="Submit" onPress={handleSelfAssessment} loading={assessLoading} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    cycleHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
    cycleName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    cycleDates: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    cycleDesc: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 13 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: {
        backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg, paddingBottom: 40, maxHeight: '90%',
        borderTopWidth: 1, borderColor: COLORS.borderLight,
    },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight, alignSelf: 'center', marginBottom: SPACING.lg },
    modalTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginBottom: 4 },
    cycleName2: { color: COLORS.primary, fontFamily: FONTS.medium, fontSize: 13, marginBottom: SPACING.md },
    actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
});
