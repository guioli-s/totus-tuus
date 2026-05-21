import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';

interface TitleProps {
  children: React.ReactNode;
  centered?: boolean;
  style?: object;
}

export function Title({ children, centered = false, style }: TitleProps) {
  const { colors, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, typography), [colors, typography]);

  return (
    <Text style={[styles.title, centered && styles.centered, style]}>
      {children}
    </Text>
  );
}

const getStyles = (colors: any, typography: any) => StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.primaryText,
  },
  centered: {
    textAlign: 'center',
  },
});
