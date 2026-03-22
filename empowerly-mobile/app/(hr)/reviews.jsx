import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { performanceReviewAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function HRReviewsScreen() {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const res = await performanceReviewAPI.getAllCycles();
            setCycles(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handlePublish = async (id) => {
        setActionLoading((p) => ({ ...p, [id]: 'publish' }));
        try {
            await performanceReviewAPI.publishCycle(id);
            Toast.show({ type: 'success', text1: '🚀 Published!', text2: 'Review cycle is now live for employees' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [id]: null })); }
    };

    const handleClose = async (id) => {
        setActionLoading((p) => ({ ...p, [id]: 'close' }));
        try {
            await performanceReviewAPI.closeCycle(id);
            Toast.show({ type: 'info', text1: 'Cycle Closed', text2: 'Review cycle has been closed' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [id]: null })); }
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
            <View style={styles.actions}>
                {item.status === 'DRAFT' && (
                    <Button title="📢 Publish" size="sm" style={{ flex: 1 }}
                        loading={actionLoading[item.id] === 'publish'}
                        onPress={() => handlePublish(item.id)} />
                )}
                {item.status === 'PUBLISHED' && (
                    <Button title="🔒 Close" size="sm" variant="outline" style={{ flex: 1, borderColor: COLORS.warning }}
                        textStyle={{ color: COLORS.warning }}
                        loading={actionLoading[item.id] === 'close'}
                        onPress={() => handleClose(item.id)} />
                )}
            </View>
        </Card>
    );

    return (
        <ScreenWrapper title="Review Cycles" subtitle="Manage performance reviews" scrollable={false}>
            <FlatList
                data={cycles}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderCycle}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
                ListEmptyComponent={!loading && <EmptyState icon="star-outline" title="No Review Cycles" subtitle="Admin can create review cycles" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    cycleHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.sm },
    cycleName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    cycleDates: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    actions: { flexDirection: 'row', gap: SPACING.sm },
});
