import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { securityAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function AdminSecurityScreen() {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [resolveLoading, setResolveLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const [statsRes, alertsRes] = await Promise.allSettled([
                securityAPI.getSecurityStats(),
                securityAPI.getActiveAlerts(),
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleResolve = async (alertId) => {
        setResolveLoading((p) => ({ ...p, [alertId]: true }));
        try {
            await securityAPI.resolveAlert(alertId, 'Resolved via mobile app');
            Toast.show({ type: 'success', text1: '✅ Alert Resolved', text2: 'Security alert has been addressed' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: 'Try again' });
        } finally { setResolveLoading((p) => ({ ...p, [alertId]: null })); }
    };

    const getSeverityColor = (severity) => {
        const map = { HIGH: COLORS.error, MEDIUM: COLORS.warning, LOW: COLORS.info };
        return map[severity?.toUpperCase()] || COLORS.textSecondary;
    };

    return (
        <ScreenWrapper title="Security" subtitle="System monitoring" scrollable={true}
            refreshing={refreshing} onRefresh={onRefresh}>
            <View style={styles.grid}>
                <StatCard title="Total Alerts" value={stats?.totalAlerts ?? '—'}
                    icon={<Ionicons name="warning" size={22} color={COLORS.error} />}
                    gradient={['rgba(255,107,107,0.15)', 'rgba(255,107,107,0.05)']}
                    style={{ flex: 1, marginRight: SPACING.sm }} />
                <StatCard title="Active" value={alerts.length}
                    icon={<Ionicons name="alert-circle" size={22} color={COLORS.warning} />}
                    gradient={['rgba(255,209,102,0.15)', 'rgba(247,151,30,0.05)']}
                    style={{ flex: 1 }} />
            </View>

            <Card title="Active Alerts" subtitle={`${alerts.length} requiring attention`}>
                {alerts.length === 0 ? (
                    <View style={styles.emptyRow}>
                        <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
                        <Text style={styles.emptyText}>All clear! No active alerts 🎉</Text>
                    </View>
                ) : (
                    alerts.map((alert, i) => (
                        <View key={alert.id || i} style={[styles.alertItem, i < alerts.length - 1 && styles.alertBorder]}>
                            <View style={[styles.alertDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
                            <View style={styles.alertInfo}>
                                <Text style={styles.alertTitle}>{alert.alertType?.replace(/_/g, ' ')}</Text>
                                <Text style={styles.alertDesc} numberOfLines={2}>{alert.description}</Text>
                                <Text style={[styles.alertSeverity, { color: getSeverityColor(alert.severity) }]}>
                                    {alert.severity} SEVERITY
                                </Text>
                            </View>
                            <Button title="Resolve" size="sm" variant="outline" style={{ borderColor: COLORS.success }}
                                textStyle={{ color: COLORS.success }}
                                loading={resolveLoading[alert.id]}
                                onPress={() => handleResolve(alert.id)} />
                        </View>
                    ))
                )}
            </Card>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', marginBottom: SPACING.md },
    emptyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
    emptyText: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 14 },
    alertItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm },
    alertBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    alertDot: { width: 10, height: 10, borderRadius: 5 },
    alertInfo: { flex: 1 },
    alertTitle: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 13 },
    alertDesc: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    alertSeverity: { fontFamily: FONTS.medium, fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
});
