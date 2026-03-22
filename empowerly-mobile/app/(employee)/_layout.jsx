import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../constants/theme';

const TabIcon = ({ name, focused }) => (
    <View style={styles.iconWrapper}>
        {focused && (
            <LinearGradient
                colors={['rgba(108,99,255,0.3)', 'transparent']}
                style={styles.activeGlow}
            />
        )}
        <Ionicons
            name={focused ? name : `${name}-outline`}
            size={22}
            color={focused ? COLORS.primary : COLORS.textMuted}
        />
    </View>
);

export default function EmployeeLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="leaves"
                options={{
                    title: 'Leaves',
                    tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="payslips"
                options={{
                    title: 'Payslips',
                    tabBarIcon: ({ focused }) => <TabIcon name="wallet" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="reviews"
                options={{
                    title: 'Reviews',
                    tabBarIcon: ({ focused }) => <TabIcon name="star" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ focused }) => <TabIcon name="ellipsis-horizontal-circle" focused={focused} />,
                }}
            />
            {/* Hidden screens accessible from More */}
            <Tabs.Screen name="skills" options={{ href: null }} />
            <Tabs.Screen name="motivation" options={{ href: null }} />
            <Tabs.Screen name="chat" options={{ href: null }} />
            <Tabs.Screen name="meetings" options={{ href: null }} />
            <Tabs.Screen name="chatbot" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.bgCard,
        borderTopColor: COLORS.borderLight,
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 10,
        paddingTop: 6,
    },
    tabLabel: {
        fontFamily: FONTS.medium,
        fontSize: 11,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeGlow: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
