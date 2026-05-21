import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  centered?: boolean;
  scrollable?: boolean;
}

export function ScreenContainer({
  children,
  centered = false,
  scrollable = false,
}: ScreenContainerProps) {
  const { colors, spacing } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing), [colors, spacing]);

  const inner = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, centered && styles.centered]}>
      {children}
    </View>
  );

  return <SafeAreaView style={styles.safe}>{inner}</SafeAreaView>;
}

const getStyles = (colors: any, spacing: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
