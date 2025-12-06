import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

// Inactivity timeout: 15 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 1 * 60 * 1000; // Show warning 1 minute before logout

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInactivityWarning, setShowInactivityWarning] = useState(false);

    const inactivityTimerRef = useRef(null);
    const warningTimerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    useEffect(() => {
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (authData) => {
        setToken(authData.token);
        setUser({
            id: authData.id,
            name: authData.name,
            email: authData.email,
            role: authData.role,
            department: authData.department,
        });
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify({
            id: authData.id,
            name: authData.name,
            email: authData.email,
            role: authData.role,
            department: authData.department,
        }));
        lastActivityRef.current = Date.now();
    };

    const logout = useCallback((reason = 'manual') => {
        setToken(null);
        setUser(null);
        setShowInactivityWarning(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Clear timers
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }

        // Show notification if logged out due to inactivity
        if (reason === 'inactivity') {
            // Create a notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Inter', sans-serif;
                font-size: 16px;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">⏰</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">Session Expired</div>
                        <div style="font-size: 14px; opacity: 0.9;">You've been logged out due to 15 minutes of inactivity</div>
                    </div>
                </div>
            `;

            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(notification);

            // Remove notification after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    document.body.removeChild(notification);
                    document.head.removeChild(style);
                }, 300);
            }, 5000);
        }
    }, []);

    const resetInactivityTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowInactivityWarning(false);

        // Clear existing timers
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }

        // Only set timers if user is logged in
        if (token && user) {
            // Set warning timer (14 minutes)
            warningTimerRef.current = setTimeout(() => {
                setShowInactivityWarning(true);
            }, INACTIVITY_TIMEOUT - WARNING_TIME);

            // Set logout timer (15 minutes)
            inactivityTimerRef.current = setTimeout(() => {
                logout('inactivity');
            }, INACTIVITY_TIMEOUT);
        }
    }, [token, user, logout]);

    // Track user activity
    useEffect(() => {
        if (!token || !user) return;

        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        let throttleTimeout = null;
        const handleActivity = () => {
            // Throttle activity tracking to once per second
            if (!throttleTimeout) {
                throttleTimeout = setTimeout(() => {
                    resetInactivityTimer();
                    throttleTimeout = null;
                }, 1000);
            }
        };

        // Add event listeners
        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timer
        resetInactivityTimer();

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (throttleTimeout) {
                clearTimeout(throttleTimeout);
            }
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
        };
    }, [token, user, resetInactivityTimer]);

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
        showInactivityWarning,
        resetInactivityTimer,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
