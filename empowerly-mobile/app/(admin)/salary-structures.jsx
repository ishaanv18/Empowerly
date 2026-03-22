import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { payrollAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function SalaryStructuresScreen() {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await payrollAPI.getAllSalaryStructures();
            setStructures(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const formatAmount = (amount) => amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '—';

    const renderStructure = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <Text style={styles.empName}>{item.employeeName || `Employee #${item.employeeId}`}</Text>
            <View style={styles.salaryGrid}>
                <View style={styles.salaryItem}>
                    <Text style={styles.salaryLabel}>Basic</Text>
                    <Text style={styles.salaryValue}>{formatAmount(item.basicSalary)}</Text>
                </View>
                <View style={styles.salaryItem}>
                    <Text style={styles.salaryLabel}>HRA</Text>
                    <Text style={styles.salaryValue}>{formatAmount(item.hra)}</Text>
                </View>
                <View style={styles.salaryItem}>
                    <Text style={styles.salaryLabel}>Allowance</Text>
                    <Text style={styles.salaryValue}>{formatAmount(item.allowances)}</Text>
                </View>
                <View style={styles.salaryItem}>
                    <Text style={styles.salaryLabel}>Gross</Text>
                    <Text style={[styles.salaryValue, { color: COLORS.success }]}>{formatAmount(item.grossSalary)}</Text>
                </View>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper title="Salary Structures" subtitle={`${structures.length} employees`} scrollable={false} showBack>
            <FlatList
                data={structures}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderStructure}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.error} />}
                ListEmptyComponent={!loading && <EmptyState icon="cash-outline" title="No Salary Structures" subtitle="Configure salary structures to manage payroll" />}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    empName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15, marginBottom: SPACING.sm },
    salaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    salaryItem: { flex: 1, minWidth: '45%', backgroundColor: COLORS.bgCardAlt, borderRadius: 8, padding: SPACING.sm },
    salaryLabel: { color: COLORS.textMuted, fontFamily: FONTS.medium, fontSize: 11, marginBottom: 4 },
    salaryValue: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 14 },
});
