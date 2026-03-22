import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { payrollAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function PayslipsScreen() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await payrollAPI.getMyPayslips();
            setPayslips(res.data || []);
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Load Failed', text2: 'Could not fetch payslips' });
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const renderPayslip = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <View style={styles.row}>
                <View style={styles.iconBox}>
                    <Ionicons name="document-text" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.period}>{getMonthName(item.month)} {item.year}</Text>
                    <Text style={styles.net}>Net Pay: <Text style={styles.netAmount}>₹{formatAmount(item.netPay)}</Text></Text>
                    <Text style={styles.detail}>Gross: ₹{formatAmount(item.grossPay)} • Tax: ₹{formatAmount(item.taxDeduction)}</Text>
                </View>
                <Badge status={item.status || 'APPROVED'} />
            </View>
        </Card>
    );

    return (
        <ScreenWrapper title="My Payslips" subtitle={`${payslips.length} payslips`} scrollable={false}>
            <FlatList
                data={payslips}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderPayslip}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={!loading && (
                    <EmptyState icon="wallet-outline" title="No Payslips Yet" subtitle="Your payslips will appear here once HR processes them" />
                )}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[(month || 1) - 1] || 'N/A';
};
const formatAmount = (amount) => amount ? Number(amount).toLocaleString('en-IN') : '0';

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 46, height: 46, borderRadius: 12,
        backgroundColor: 'rgba(108,99,255,0.12)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    info: { flex: 1 },
    period: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    net: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 13, marginTop: 2 },
    netAmount: { color: COLORS.success, fontFamily: FONTS.bold },
    detail: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 11, marginTop: 2 },
});
