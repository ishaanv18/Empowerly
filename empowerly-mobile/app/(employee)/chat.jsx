import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { chatAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatRef = useRef(null);

    const loadConversations = useCallback(async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data || []);
        } catch (e) { } finally { setLoading(false); }
    }, []);

    const loadMessages = useCallback(async (convId) => {
        try {
            const res = await chatAPI.getMessages(convId);
            setMessages(res.data || []);
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (e) { }
    }, []);

    useEffect(() => { loadConversations(); }, []);

    const handleSelectConv = (conv) => {
        setSelectedConv(conv);
        loadMessages(conv.id);
        chatAPI.markAsRead(conv.id).catch(() => { });
    };

    const handleSend = async () => {
        if (!messageInput.trim() || !selectedConv) return;
        const content = messageInput.trim();
        setMessageInput('');
        setSending(true);
        try {
            await chatAPI.sendMessage(selectedConv.otherUserId, content);
            await loadMessages(selectedConv.id);
        } catch (e) {
            Toast.show({ type: 'error', text1: 'Send Failed', text2: 'Message not delivered' });
        } finally { setSending(false); }
    };

    if (loading) return <LoadingSpinner message="Loading messages..." />;

    // Message thread view
    if (selectedConv) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.chatHeader}>
                    <TouchableOpacity onPress={() => setSelectedConv(null)} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.chatAvatar}>
                        <Text style={styles.chatAvatarText}>{selectedConv.otherUserName?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.chatName}>{selectedConv.otherUserName}</Text>
                        <Text style={styles.chatRole}>{selectedConv.otherUserRole || 'Member'}</Text>
                    </View>
                </LinearGradient>

                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <FlatList ref={flatRef} data={messages} keyExtractor={(item, i) => String(item.id || i)}
                        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }}
                        renderItem={({ item }) => {
                            const isMine = item.senderId === user?.id || item.senderEmail === user?.email;
                            return (
                                <View style={[styles.bubbleContainer, isMine && styles.bubbleContainerRight]}>
                                    {isMine ? (
                                        <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={[styles.bubble, styles.bubbleRight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                            <Text style={styles.bubbleText}>{item.content}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={[styles.bubble, styles.bubbleLeft]}>
                                            <Text style={[styles.bubbleText, { color: COLORS.textPrimary }]}>{item.content}</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                    <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
                        <TextInput
                            style={styles.msgInput}
                            placeholder="Type a message..."
                            placeholderTextColor={COLORS.textMuted}
                            value={messageInput}
                            onChangeText={setMessageInput}
                            multiline
                        />
                        <TouchableOpacity onPress={handleSend} disabled={sending || !messageInput.trim()}
                            style={[styles.sendBtn, (!messageInput.trim()) && styles.sendBtnDisabled]}>
                            <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={styles.sendBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                <Ionicons name="send" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }

    // Conversation list
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.listHeader}>
                <Text style={styles.headerTitle}>Messages</Text>
            </LinearGradient>
            <FlatList
                data={conversations}
                keyExtractor={(item, i) => String(item.id || i)}
                contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.convItem} onPress={() => handleSelectConv(item)}>
                        <View style={styles.convAvatar}>
                            <Text style={styles.convAvatarText}>{item.otherUserName?.charAt(0)?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.convInfo}>
                            <Text style={styles.convName}>{item.otherUserName}</Text>
                            <Text style={styles.convLast} numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
                        </View>
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="No Conversations" subtitle="Start a chat with your team members" />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    chatHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
    chatAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    chatAvatarText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
    chatName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 16 },
    chatRole: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 },
    bubbleContainer: { marginBottom: 8, alignItems: 'flex-start' },
    bubbleContainerRight: { alignItems: 'flex-end' },
    bubble: { maxWidth: '80%', borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleLeft: { backgroundColor: COLORS.bgCard },
    bubbleRight: {},
    bubbleText: { color: '#fff', fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.sm, paddingTop: 0, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    msgInput: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10, color: COLORS.textPrimary, fontFamily: FONTS.regular, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: COLORS.borderLight },
    sendBtn: { marginBottom: 2 },
    sendBtnDisabled: { opacity: 0.4 },
    sendBtnGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    listHeader: { padding: SPACING.md, paddingBottom: SPACING.md },
    headerTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 22 },
    convItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    convAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    convAvatarText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 18 },
    convInfo: { flex: 1 },
    convName: { color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 15 },
    convLast: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 13, marginTop: 2 },
    unreadBadge: { backgroundColor: COLORS.primary, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    unreadText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 11 },
});
