import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { auditLogAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function AuditLogsScreen() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await auditLogAPI.getAllLogs({ page: 0, size: 50 });
            setLogs(res.data?.content || res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const getActionColor = (action) => {
        if (action?.includes('DELETE')) return COLORS.error;
        if (action?.includes('CREATE')) return COLORS.success;
        if (action?.includes('UPDATE')) return COLORS.warning;
        return COLORS.info;
    };

    const renderLog = ({ item }) => (
        <Card style={{ marginBottom: SPACING.xs }}>
            <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: getActionColor(item.action) }]} />
                <View style={styles.info}>
                    <Text style={styles.action}>{item.action}</Text>
                    <Text style={styles.user}>{item.userName} • {item.entityType}</Text>
                    <Text style={styles.time}>{new Date(item.timestamp || item.createdAt).toLocaleString()}</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper title="Audit Logs" subtitle="System activity trail" scrollable={false} showBack>
            <FlatList
                data={logs}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderLog}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.error} />}
                ListEmptyComponent={!loading && <EmptyState icon="bar-chart-outline" title="No Audit Logs" subtitle="System activity will appear here" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
    info: { flex: 1 },
    action: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 13 },
    user: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    time: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 11, marginTop: 2 },
});
