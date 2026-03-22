import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { userAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function AdminUsersScreen() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await userAPI.getAllUsers();
            setUsers(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const renderUser = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: item.role === 'ADMIN' ? 'rgba(255,107,107,0.3)' : item.role === 'HR' ? 'rgba(157,78,221,0.3)' : 'rgba(108,99,255,0.3)' }]}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.dept}>{item.department}</Text>
                </View>
                <Badge status={item.role} />
            </View>
        </Card>
    );

    return (
        <ScreenWrapper title="User Management" subtitle={`${users.length} total users`} scrollable={false}>
            <FlatList
                data={users}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderUser}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.error} />}
                ListEmptyComponent={!loading && <EmptyState icon="people-outline" title="No Users" subtitle="Users will appear here once they sign up" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    avatarText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 18 },
    info: { flex: 1 },
    name: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    email: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12, marginTop: 2 },
    dept: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 11, marginTop: 1 },
});
