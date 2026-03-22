import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { performanceReviewAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function AdminReviewsScreen() {
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

    const handleDelete = async (id) => {
        setActionLoading((p) => ({ ...p, [id]: 'delete' }));
        try {
            await performanceReviewAPI.deleteCycle(id);
            Toast.show({ type: 'success', text1: 'Cycle Deleted', text2: 'Review cycle has been removed' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Delete Failed', text2: e.response?.data?.message || 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [id]: null })); }
    };

    const renderCycle = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.dates}>{item.startDate} → {item.endDate}</Text>
                </View>
                <Badge status={item.status} />
            </View>
            <Button title="🗑 Delete" size="sm" variant="danger" style={{ alignSelf: 'flex-end', marginTop: SPACING.sm }}
                loading={actionLoading[item.id] === 'delete'}
                onPress={() => handleDelete(item.id)} />
        </Card>
    );

    return (
        <ScreenWrapper title="Review Administration" subtitle="Manage review cycles" scrollable={false} showBack>
            <FlatList
                data={cycles}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderCycle}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.error} />}
                ListEmptyComponent={!loading && <EmptyState icon="star-outline" title="No Review Cycles" subtitle="HR can create performance review cycles" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    name: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    dates: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
});
