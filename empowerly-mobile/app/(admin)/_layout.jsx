import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../constants/theme';

const TabIcon = ({ name, focused }) => (
    <View style={styles.iconWrapper}>
        {focused && <LinearGradient colors={['rgba(255,107,107,0.3)', 'transparent']} style={styles.activeGlow} />}
        <Ionicons name={focused ? name : `${name}-outline`} size={22} color={focused ? COLORS.error : COLORS.textMuted} />
    </View>
);

export default function AdminLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: COLORS.error,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: styles.tabLabel,
        }}>
            <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon name="shield-checkmark" focused={focused} /> }} />
            <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} /> }} />
            <Tabs.Screen name="payroll" options={{ title: 'Payroll', tabBarIcon: ({ focused }) => <TabIcon name="wallet" focused={focused} /> }} />
            <Tabs.Screen name="security" options={{ title: 'Security', tabBarIcon: ({ focused }) => <TabIcon name="shield" focused={focused} /> }} />
            <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ focused }) => <TabIcon name="ellipsis-horizontal-circle" focused={focused} /> }} />
            <Tabs.Screen name="reviews" options={{ href: null }} />
            <Tabs.Screen name="audit-logs" options={{ href: null }} />
            <Tabs.Screen name="salary-structures" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: { backgroundColor: COLORS.bgCard, borderTopColor: COLORS.borderLight, borderTopWidth: 1, height: 70, paddingBottom: 10, paddingTop: 6 },
    tabLabel: { fontFamily: FONTS.medium, fontSize: 11 },
    iconWrapper: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    activeGlow: { position: 'absolute', width: 40, height: 40, borderRadius: 20 },
});
