import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import { COLORS, SPACING } from '../../constants/theme';

const ScreenWrapper = ({
    children,
    title,
    subtitle,
    showBack = false,
    rightAction,
    scrollable = true,
    refreshing = false,
    onRefresh,
    style,
    contentStyle,
    noHeader = false,
}) => {
    const content = (
        <View style={[styles.content, contentStyle]}>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, style]} edges={['left', 'right', 'bottom']}>
            {!noHeader && (
                <Header title={title} subtitle={subtitle} showBack={showBack} rightAction={rightAction} />
            )}
            {scrollable ? (
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        onRefresh ? (
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={COLORS.primary}
                                colors={[COLORS.primary]}
                            />
                        ) : undefined
                    }
                >
                    {content}
                </ScrollView>
            ) : (
                content
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
});

export default ScreenWrapper;
