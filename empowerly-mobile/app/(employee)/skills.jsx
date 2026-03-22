import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { skillAPI } from '../../services/api';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function SkillsScreen() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generateLoading, setGenerateLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await skillAPI.getMySuggestions();
            setSuggestions(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleGenerate = async () => {
        setGenerateLoading(true);
        try {
            await skillAPI.generateSuggestions();
            Toast.show({ type: 'success', text1: '🤖 Skills Generated!', text2: 'AI has created personalized skill suggestions' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Generation Failed', text2: 'Try again later' });
        } finally { setGenerateLoading(false); }
    };

    const handleMarkComplete = async (skill) => {
        try {
            await skillAPI.markSkillCompleted(skill);
            Toast.show({ type: 'success', text1: '🎯 Skill Completed!', text2: `Great job completing: ${skill}` });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Update Failed', text2: 'Try again' });
        }
    };

    const renderSuggestion = ({ item }) => (
        <Card style={{ marginBottom: SPACING.sm }}>
            <Text style={styles.category}>{item.category}</Text>
            {(item.skills || []).map((skill, i) => (
                <View key={i} style={styles.skillRow}>
                    <View style={styles.skillDot} />
                    <Text style={styles.skillName}>{skill}</Text>
                    <TouchableOpacity onPress={() => handleMarkComplete(skill)} style={styles.checkBtn}>
                        <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
                    </TouchableOpacity>
                </View>
            ))}
        </Card>
    );

    return (
        <ScreenWrapper title="Skill Development" subtitle="AI-powered suggestions"
            scrollable={false}
            rightAction={
                <Button title="Generate" size="sm" loading={generateLoading} onPress={handleGenerate}
                    icon={<Ionicons name="sparkles" size={14} color="#fff" />} />
            }>
            <FlatList
                data={suggestions}
                keyExtractor={(item, i) => String(item.id || i)}
                renderItem={renderSuggestion}
                contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={!loading && (
                    <EmptyState icon="bulb-outline" title="No Skill Suggestions"
                        subtitle="Tap Generate to get AI-powered skill recommendations"
                        action={<Button title="Generate Now" onPress={handleGenerate} loading={generateLoading} size="sm"
                            icon={<Ionicons name="sparkles" size={14} color="#fff" />} />} />
                )}
                showsVerticalScrollIndicator={false}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    category: { color: COLORS.primary, fontFamily: FONTS.semibold, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
    skillRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    skillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: SPACING.sm },
    skillName: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.regular, fontSize: 14 },
    checkBtn: { padding: 4 },
});
