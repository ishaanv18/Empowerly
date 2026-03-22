import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

const STATUS_MAP = {
    // Leave statuses
    APPROVED: { color: COLORS.success, bg: COLORS.successBg, label: 'Approved' },
    PENDING: { color: COLORS.warning, bg: COLORS.warningBg, label: 'Pending' },
    REJECTED: { color: COLORS.error, bg: COLORS.errorBg, label: 'Rejected' },
    REVOKED: { color: COLORS.textMuted, bg: 'rgba(100,100,120,0.15)', label: 'Revoked' },
    // Attendance
    PRESENT: { color: COLORS.success, bg: COLORS.successBg, label: 'Present' },
    ABSENT: { color: COLORS.error, bg: COLORS.errorBg, label: 'Absent' },
    LATE: { color: COLORS.warning, bg: COLORS.warningBg, label: 'Late' },
    // Roles
    ADMIN: { color: COLORS.error, bg: COLORS.errorBg, label: 'Admin' },
    HR: { color: COLORS.secondary, bg: 'rgba(157,78,221,0.12)', label: 'HR' },
    EMPLOYEE: { color: COLORS.primary, bg: 'rgba(108,99,255,0.12)', label: 'Employee' },
    // General
    ACTIVE: { color: COLORS.success, bg: COLORS.successBg, label: 'Active' },
    INACTIVE: { color: COLORS.error, bg: COLORS.errorBg, label: 'Inactive' },
    DRAFT: { color: COLORS.info, bg: COLORS.infoBg, label: 'Draft' },
    PUBLISHED: { color: COLORS.success, bg: COLORS.successBg, label: 'Published' },
    CLOSED: { color: COLORS.textMuted, bg: 'rgba(100,100,120,0.15)', label: 'Closed' },
};

const Badge = ({ status, label, color, bg, size = 'sm', style }) => {
    const mapped = STATUS_MAP[status?.toUpperCase()] || {};
    const displayLabel = label || mapped.label || status || '';
    const displayColor = color || mapped.color || COLORS.textSecondary;
    const displayBg = bg || mapped.bg || 'rgba(100,100,120,0.15)';

    const dotSize = size === 'sm' ? 6 : 8;
    const fontSize = size === 'sm' ? 11 : 13;

    return (
        <View style={[styles.badge, { backgroundColor: displayBg }, style]}>
            <View style={[styles.dot, { backgroundColor: displayColor, width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
            <Text style={[styles.label, { color: displayColor, fontSize }]}>{displayLabel}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        gap: 5,
        alignSelf: 'flex-start',
    },
    dot: {},
    label: {
        fontFamily: FONTS.medium,
        letterSpacing: 0.2,
    },
});

export default Badge;
