import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';

export function Divider() {
  const { colors, spacing } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing), [colors, spacing]);

  return <View style={styles.divider} />;
}

const getStyles = (colors: any, spacing: any) => StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
});
