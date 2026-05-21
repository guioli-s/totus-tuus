import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { Divider } from '../../components/Divider';
import { BackButton } from '../../components/BackButton';
import { useExamenStore } from '../../store/useExamenStore';
import { useAppTheme } from '../../theme';

export function ConfessionScreen() {
  const finalConfessionList = useExamenStore((s) => s.finalConfessionList);
  const { colors, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography), [colors, spacing, typography]);

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <BackButton />
        <Title style={styles.pageTitle}>Minha Confissão</Title>
      </View>

      {finalConfessionList.length === 0 ? (
        <View style={styles.emptyState}>
          <Paragraph centered style={styles.emptyText}>
            Nenhuma confissão registrada ainda.{'\n\n'}
            Complete um exame de consciência para ver os resultados aqui.
          </Paragraph>
        </View>
      ) : (
        <>
          <Paragraph style={styles.subtitle}>
            {finalConfessionList.length === 1
              ? '1 Pecado identificado diante dos mandamentos.'
              : `${finalConfessionList.length} Pecados identificados diante dos mandamentos.`}
          </Paragraph>
          <Divider />

          {finalConfessionList.map((entry, index) => {
            const hasText = entry.reflection && entry.reflection.trim().length > 0;
            return (
              <View key={entry.commandmentId}>
                <Text style={styles.ordinal}>{entry.commandmentId}º mandamento</Text>
                <Text style={styles.entryTitle}>{entry.commandmentTitle}</Text>
                {hasText && (
                  <Text style={styles.entryReflection}>{entry.reflection}</Text>
                )}
                {index < finalConfessionList.length - 1 && <Divider />}
              </View>
            );
          })}

          <View style={styles.closingBlock}>
            <Paragraph centered style={styles.closingText}>
              Leve isso com sinceridade para a confissão.
            </Paragraph>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const getStyles = (colors: any, spacing: any, typography: any) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pageTitle: { marginBottom: 0 },
  subtitle: { marginBottom: spacing.sm, lineHeight: 22 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: { lineHeight: 30, color: colors.secondaryText },
  ordinal: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
  },
  entryTitle: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '500',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  entryReflection: {
    ...typography.body,
    color: colors.secondaryText,
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  closingBlock: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  closingText: { fontSize: 16, lineHeight: 28, letterSpacing: 0.3 },
});
