import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
}

export function SecondaryButton({ title, onPress }: SecondaryButtonProps) {
  const { colors, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography), [colors, spacing, typography]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any, spacing: any, typography: any) => StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  text: {
    ...typography.body,
    color: colors.secondaryText,
  },
});
