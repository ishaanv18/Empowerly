import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { chatbotAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const QUICK_QUESTIONS = [
    'How many leaves do I have?',
    'When is my next meeting?',
    'What is my current payroll status?',
    'How to apply for leave?',
];

export default function ChatbotScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hi! I'm the Empowerly AI Assistant. Ask me anything about your HR details, attendance, leaves, or payroll! 🤖" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatRef = useRef(null);

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;
        const userMsg = { id: Date.now(), type: 'user', text: text.trim() };
        setMessages((m) => [...m, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await chatbotAPI.ask(text.trim());
            setMessages((m) => [...m, { id: Date.now() + 1, type: 'bot', text: res.data?.response || 'Sorry, I could not process that.' }]);
        } catch (e) {
            setMessages((m) => [...m, { id: Date.now() + 1, type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient colors={['#0F0C29', '#1a163a']} style={styles.header}>
                <View style={styles.botAvatar}>
                    <Ionicons name="robot" size={24} color="#fff" />
                </View>
                <View>
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                    <Text style={styles.headerSub}>Powered by Empowerly AI</Text>
                </View>
                <View style={styles.onlineDot} />
            </LinearGradient>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[styles.msgRow, item.type === 'user' && styles.msgRowRight]}>
                            {item.type === 'bot' && (
                                <View style={styles.botIconSmall}>
                                    <Ionicons name="robot" size={16} color={COLORS.primary} />
                                </View>
                            )}
                            {item.type === 'user' ? (
                                <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={styles.bubble} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    <Text style={styles.bubbleText}>{item.text}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={[styles.bubble, styles.botBubble]}>
                                    <Text style={[styles.bubbleText, { color: COLORS.textPrimary }]}>{item.text}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    ListFooterComponent={loading && (
                        <View style={styles.msgRow}>
                            <View style={styles.botIconSmall}><Ionicons name="robot" size={16} color={COLORS.primary} /></View>
                            <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                                <Text style={styles.typingText}>Thinking...</Text>
                            </View>
                        </View>
                    )}
                />

                {/* Quick questions */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow} contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: SPACING.sm }}>
                    {QUICK_QUESTIONS.map((q) => (
                        <TouchableOpacity key={q} onPress={() => sendMessage(q)} style={styles.quickChip}>
                            <Text style={styles.quickText}>{q}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask me anything..."
                        placeholderTextColor={COLORS.textMuted}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={() => sendMessage(input)}
                        returnKeyType="send"
                    />
                    <TouchableOpacity onPress={() => sendMessage(input)} disabled={loading || !input.trim()}
                        style={[styles.sendBtn, (loading || !input.trim()) && { opacity: 0.4 }]}>
                        <LinearGradient colors={['#6C63FF', '#9D4EDD']} style={styles.sendGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="send" size={18} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md },
    botAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(108,99,255,0.3)', borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: COLORS.textPrimary, fontFamily: FONTS.bold, fontSize: 17 },
    headerSub: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success, marginLeft: 'auto' },
    msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
    msgRowRight: { flexDirection: 'row-reverse' },
    botIconSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(108,99,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    bubble: { maxWidth: '80%', borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 10 },
    botBubble: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderLight },
    bubbleText: { color: '#fff', fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
    typingBubble: { paddingVertical: 14 },
    typingText: { color: COLORS.textMuted, fontFamily: FONTS.regular, fontSize: 13, fontStyle: 'italic' },
    quickRow: { maxHeight: 52, paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    quickChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: 'rgba(108,99,255,0.15)', borderWidth: 1, borderColor: COLORS.border },
    quickText: { color: COLORS.primary, fontFamily: FONTS.medium, fontSize: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.sm, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    input: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10, color: COLORS.textPrimary, fontFamily: FONTS.regular, fontSize: 14, borderWidth: 1, borderColor: COLORS.borderLight },
    sendBtn: {},
    sendGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
