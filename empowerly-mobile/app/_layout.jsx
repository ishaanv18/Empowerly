import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthProvider } from '../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: COLORS.success,
                backgroundColor: COLORS.bgCard,
                borderRadius: RADIUS.md,
                shadowColor: COLORS.success,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
            }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            text1Style={{ color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 }}
            text2Style={{ color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: COLORS.error,
                backgroundColor: COLORS.bgCard,
                borderRadius: RADIUS.md,
                shadowColor: COLORS.error,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
            }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            text1Style={{ color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 }}
            text2Style={{ color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 }}
        />
    ),
    info: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: COLORS.info,
                backgroundColor: COLORS.bgCard,
                borderRadius: RADIUS.md,
                shadowColor: COLORS.info,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
            }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            text1Style={{ color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 }}
            text2Style={{ color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 }}
        />
    ),
    warning: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: COLORS.warning,
                backgroundColor: COLORS.bgCard,
                borderRadius: RADIUS.md,
                shadowColor: COLORS.warning,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
            }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            text1Style={{ color: COLORS.textPrimary, fontFamily: FONTS.semibold, fontSize: 14 }}
            text2Style={{ color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: 12 }}
        />
    ),
};

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
        Poppins_700Bold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <StatusBar style="light" />
                    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                        <Stack.Screen name="(employee)" />
                        <Stack.Screen name="(hr)" />
                        <Stack.Screen name="(admin)" />
                    </Stack>
                    <Toast config={toastConfig} topOffset={60} visibilityTime={3000} />
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
