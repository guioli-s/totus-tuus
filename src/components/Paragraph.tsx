import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme';

interface ParagraphProps {
  children: React.ReactNode;
  centered?: boolean;
  small?: boolean;
  style?: object;
}

export function Paragraph({
  children,
  centered = false,
  small = false,
  style,
}: ParagraphProps) {
  const { colors, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, typography), [colors, typography]);

  return (
    <Text
      style={[
        styles.paragraph,
        small && styles.small,
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const getStyles = (colors: any, typography: any) => StyleSheet.create({
  paragraph: {
    ...typography.body,
    color: colors.secondaryText,
  },
  small: {
    ...typography.small,
    color: colors.secondaryText,
  },
  centered: {
    textAlign: 'center',
  },
});
