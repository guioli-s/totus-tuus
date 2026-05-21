import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function PrimaryButton({ title, onPress, disabled = false, style, textStyle }: PrimaryButtonProps) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, radius, typography), [colors, spacing, radius, typography]);

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any, spacing: any, radius: any, typography: any) => StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    ...typography.body,
    color: '#000', // Manter preto sobre dourado para contraste
    fontWeight: '600',
  },
});
