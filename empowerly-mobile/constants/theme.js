// Theme constants for the Empowerly app
export const COLORS = {
    // Brand gradient
    primary: '#6C63FF',
    primaryDark: '#4834d4',
    secondary: '#9D4EDD',
    accent: '#38ef7d',

    // Backgrounds
    bg: '#0F0C29',
    bgCard: '#1A1535',
    bgCardAlt: '#211d40',
    bgSurface: '#16132e',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A9A6C8',
    textMuted: '#6B68A0',

    // Status
    success: '#38ef7d',
    successBg: 'rgba(56,239,125,0.12)',
    warning: '#FFD166',
    warningBg: 'rgba(255,209,102,0.12)',
    error: '#FF6B6B',
    errorBg: 'rgba(255,107,107,0.12)',
    info: '#4FC3F7',
    infoBg: 'rgba(79,195,247,0.12)',

    // UI
    border: 'rgba(108,99,255,0.25)',
    borderLight: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(0,0,0,0.6)',

    // Role colors
    employee: '#6C63FF',
    hr: '#9D4EDD',
    admin: '#FF6B6B',

    // Gradients
    gradientPrimary: ['#302b63', '#0f0c29'],
    gradientCard: ['rgba(108,99,255,0.15)', 'rgba(157,78,221,0.05)'],
    gradientSuccess: ['#11998e', '#38ef7d'],
    gradientWarning: ['#f7971e', '#FFD166'],
    gradientError: ['#FF6B6B', '#c0392b'],
};

export const FONTS = {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    interRegular: 'Inter_400Regular',
    interMedium: 'Inter_500Medium',
    interSemibold: 'Inter_600SemiBold',
    interBold: 'Inter_700Bold',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    small: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    medium: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    large: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
};

export const API_BASE_URL = 'http://172.25.236.148:8080/api';
