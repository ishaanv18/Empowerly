import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, RefreshControl,
    TouchableOpacity, Modal, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { motivationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const CATEGORIES = ['ACHIEVEMENT', 'MILESTONE', 'QUOTE', 'GENERAL'];

export default function MotivationScreen() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ content: '', category: 'ACHIEVEMENT' });

    const loadData = useCallback(async () => {
        try {
            const res = await motivationAPI.getAllPosts();
            setPosts(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, []);
    const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

    const handleCreate = async () => {
        if (!form.content.trim()) { Toast.show({ type: 'warning', text1: 'Empty Post', text2: 'Write something first!' }); return; }
        setCreating(true);
        try {
            await motivationAPI.createPost(form);
            Toast.show({ type: 'success', text1: '🔥 Posted!', text2: 'Your motivation has been shared' });
            setCreateModal(false);
            setForm({ content: '', category: 'ACHIEVEMENT' });
            await loadData();
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Post Failed', text2: 'Try again' });
        } finally { setCreating(false); }
    };

    const handleLike = async (postId) => {
        try {
            await motivationAPI.toggleLike(postId);
            await loadData();
        } catch (e) { }
    };

    const renderPost = ({ item }) => (
        <View style={styles.postCard}>
            <LinearGradient colors={['rgba(108,99,255,0.1)', 'transparent']} style={styles.postGrad}>
                <View style={styles.postHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.authorName?.charAt(0)?.toUpperCase() || 'E'}</Text>
                    </View>
                    <View>
                        <Text style={styles.authorName}>{item.authorName}</Text>
                        <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.catBadge, { backgroundColor: getCatColor(item.category) + '22' }]}>
                        <Text style={[styles.catText, { color: getCatColor(item.category) }]}>{item.category}</Text>
                    </View>
                </View>
                <Text style={styles.postContent}>{item.content}</Text>
                <View style={styles.postActions}>
                    <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(item.id)}>
                        <Ionicons name="heart" size={18} color={COLORS.error} />
                        <Text style={styles.likeCount}>{item.likeCount || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.likeBtn}>
                        <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.likeCount}>{item.commentCount || 0}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <>
            <ScreenWrapper title="Motivation Wall" subtitle="Share your wins 🔥"
                scrollable={false}
                rightAction={
                    <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModal(true)}>
                        <Ionicons name="add" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                }>
                <FlatList
                    data={posts}
                    keyExtractor={(item, i) => String(item.id || i)}
                    renderItem={renderPost}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    ListEmptyComponent={!loading && <EmptyState icon="flame-outline" title="No Posts Yet" subtitle="Be the first to share some motivation!" />}
                    showsVerticalScrollIndicator={false}
                />
            </ScreenWrapper>

            <Modal visible={createModal} animationType="slide" transparent onRequestClose={() => setCreateModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.handle} />
                        <Text style={styles.modalTitle}>Share Your Win 🔥</Text>
                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
                            {CATEGORIES.map((c) => (
                                <TouchableOpacity key={c} onPress={() => setForm({ ...form, category: c })}
                                    style={[styles.chip, form.category === c && styles.chipActive]}>
                                    <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Input label="Your Message" placeholder="Share something awesome..." value={form.content}
                            onChangeText={(t) => setForm({ ...form, content: t })} multiline numberOfLines={5} />
                        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
                            <Button title="Cancel" variant="outline" onPress={() => setCreateModal(false)} style={{ flex: 1 }} />
                            <Button title="Post" onPress={handleCreate} loading={creating} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const getCatColor = (cat) => {
    const map = { ACHIEVEMENT: '#38ef7d', MILESTONE: '#6C63FF', QUOTE: '#FFD166', GENERAL: '#4FC3F7' };
    return map[cat] || COLORS.primary;
};

const styles = StyleSheet.create({
    postCard: { marginBottom: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderLight },
    postGrad: { padding: SPACING.md },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 15 },
    authorName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 },
    postDate: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 11 },
    catBadge: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    catText: { fontFamily: FONTS.medium, fontSize: 11 },
    postContent: { color: COLORS.textPrimary, fontFamily: FONTS.regular, fontSize: 14, lineHeight: 22, marginBottom: SPACING.sm },
    postActions: { flexDirection: 'row', gap: SPACING.md },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    likeCount: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 13 },
    createBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(108,99,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalSheet: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: COLORS.borderLight },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.borderLight, alignSelf: 'center', marginBottom: SPACING.lg },
    modalTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 20, marginBottom: SPACING.md },
    label: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 8 },
    chip: { paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderLight, marginRight: SPACING.sm, backgroundColor: COLORS.bgCard },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontFamily: FONTS.medium, fontSize: 12 },
    chipTextActive: { color: '#fff' },
});
