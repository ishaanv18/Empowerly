import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { meetingAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function MeetingsScreen() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await meetingAPI.getUpcoming();
            setMeetings(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const renderMeeting = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.row}>
                <View style={styles.iconBox}>
                    <Ionicons name="videocam" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.time}>
                        {item.scheduledTime ? new Date(item.scheduledTime).toLocaleString() : 'No time set'}
                    </Text>
                    {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
                </View>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper title="Meetings" subtitle="Upcoming meetings" scrollable={false}>
            <FlatList
                data={meetings}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderMeeting}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={!loading && (
                    <EmptyState icon="videocam-outline" title="No Upcoming Meetings" subtitle="Your scheduled meetings will appear here" />
                )}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    iconBox: {
        width: 46, height: 46, borderRadius: 12,
        backgroundColor: 'rgba(108,99,255,0.12)',
        alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
    },
    info: { flex: 1 },
    title: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    time: { color: COLORS.primary, fontFamily: FONTS.medium, fontSize: 12, marginTop: 2 },
    desc: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 13, marginTop: 4 },
});
