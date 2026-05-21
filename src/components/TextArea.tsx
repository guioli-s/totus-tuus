import React, { forwardRef, useMemo } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useAppTheme } from '../theme';

type TextAreaProps = TextInputProps;

export const TextArea = forwardRef<TextInput, TextAreaProps>((props, ref) => {
  const { colors, spacing, radius, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, radius, typography), [colors, spacing, radius, typography]);

  return (
    <TextInput
      ref={ref}
      multiline
      placeholder="Escreva aqui..."
      placeholderTextColor={colors.placeholder}
      textAlignVertical="top"
      scrollEnabled={false}
      {...props}
      style={[styles.input, props.style]}
    />
  );
});

TextArea.displayName = 'TextArea';

const getStyles = (colors: any, spacing: any, radius: any, typography: any) => StyleSheet.create({
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.primaryText,
    padding: spacing.md,
    borderRadius: radius.md,
    minHeight: 200,
    ...typography.body,
    textAlignVertical: 'top',
  },
});
