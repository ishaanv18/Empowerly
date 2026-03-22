import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { feedbackAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function HRFeedbackScreen() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const loadData = useCallback(async () => {
        try {
            const res = await feedbackAPI.getAllFeedback();
            setFeedback(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleStatusChange = async (id, status) => {
        setActionLoading((p) => ({ ...p, [id]: status }));
        try {
            await feedbackAPI.updateStatus(id, status);
            Toast.show({ type: 'success', text1: 'Status Updated', text2: `Feedback marked as ${status}` });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed', text2: 'Try again' });
        } finally { setActionLoading((p) => ({ ...p, [id]: null })); }
    };

    const renderFeedback = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.subject}>{item.subject || 'Feedback'}</Text>
                    <Text style={styles.from}>{item.submitterName || 'Anonymous'}</Text>
                </View>
                <Badge status={item.status || 'OPEN'} />
            </View>
            <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
            {item.status === 'OPEN' && (
                <View style={styles.actions}>
                    <Button title="In Progress" size="sm" variant="outline" style={{ flex: 1, borderColor: COLORS.warning }}
                        textStyle={{ color: COLORS.warning }}
                        loading={actionLoading[item.id] === 'IN_PROGRESS'}
                        onPress={() => handleStatusChange(item.id, 'IN_PROGRESS')} />
                    <Button title="Resolve" size="sm" style={{ flex: 1 }}
                        loading={actionLoading[item.id] === 'RESOLVED'}
                        onPress={() => handleStatusChange(item.id, 'RESOLVED')} />
                </View>
            )}
        </Card>
    );

    return (
        <ScreenWrapper title="Feedback" subtitle={`${feedback.length} submissions`} showBack scrollable={false}>
            <FlatList
                data={feedback}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderFeedback}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
                ListEmptyComponent={!loading && <EmptyState icon="chatbox-outline" title="No Feedback" subtitle="Employee feedback will appear here" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs },
    subject: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 },
    from: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    content: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 20, marginBottom: SPACING.sm },
    actions: { flexDirection: 'row', gap: SPACING.sm },
});
