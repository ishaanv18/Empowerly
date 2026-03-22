import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Index() {
    const { loading, isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated()) {
                const role = user?.role?.toUpperCase();
                if (role === 'ADMIN') router.replace('/(admin)');
                else if (role === 'HR') router.replace('/(hr)');
                else router.replace('/(employee)');
            } else {
                router.replace('/(auth)/login');
            }
        }
    }, [loading, isAuthenticated, user]);

    return <LoadingSpinner message="Starting Empowerly..." />;
}
