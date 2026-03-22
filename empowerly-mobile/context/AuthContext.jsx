import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error('Failed to load auth', e);
            } finally {
                setLoading(false);
            }
        };
        loadAuth();
    }, []);

    const login = useCallback(async (authData) => {
        const userData = {
            id: authData.id,
            name: authData.name,
            email: authData.email,
            role: authData.role,
            department: authData.department,
        };
        setToken(authData.token);
        setUser(userData);
        await AsyncStorage.setItem('token', authData.token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        // Navigate based on role
        const role = authData.role?.toUpperCase();
        if (role === 'ADMIN') {
            router.replace('/(admin)');
        } else if (role === 'HR') {
            router.replace('/(hr)');
        } else {
            router.replace('/(employee)');
        }
    }, []);

    const logout = useCallback(async () => {
        setToken(null);
        setUser(null);
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/(auth)/login');
    }, []);

    const isAuthenticated = () => !!token && !!user;

    const hasRole = (role) => user?.role?.toUpperCase() === role?.toUpperCase();

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
