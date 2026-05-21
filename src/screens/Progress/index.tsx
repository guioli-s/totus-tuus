import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Divider } from '../../components/Divider';
import { commandments } from '../../content/commandments';
import { useExamenStore } from '../../store/useExamenStore';
import { ReflexaoStackParamList } from '../../navigation/ReflexaoNavigator';
import { colors, spacing, typography } from '../../theme';

// Tela de progresso mantida mas fora do fluxo principal
type Props = { navigation: any };

export function ProgressScreen({ navigation }: Props) {
  const reflections = useExamenStore((s) => s.reflections);

  const reflectedCount = Object.values(reflections).filter(
    (e) => e.sinned
  ).length;

  return (
    <ScreenContainer scrollable>
      <Title style={styles.title}>Progresso</Title>
      <Paragraph style={styles.subtitle}>
        {reflectedCount} de {commandments.length} mandamentos refletidos
      </Paragraph>

      <Divider />

      {commandments.map((c, index) => {
        const entry = reflections[c.id];
        const hasReflection = entry?.sinned === true;
        const wasSkipped = entry?.skipped === true && !hasReflection;

        return (
          <View key={c.id}>
            <View style={styles.row}>
              <Text style={hasReflection ? styles.iconDone : styles.iconSkipped}>
                {hasReflection ? '✔' : '➖'}
              </Text>
              <View style={styles.rowText}>
                <Text style={styles.ordinal}>{c.id}º</Text>
                <Text style={[
                  styles.name,
                  !hasReflection && styles.nameSkipped,
                ]}>
                  {c.title}
                </Text>
                {wasSkipped && (
                  <Text style={styles.skippedLabel}>não refletido</Text>
                )}
              </View>
            </View>
            {index < commandments.length - 1 && <View style={styles.itemDivider} />}
          </View>
        );
      })}

      <View style={styles.actions}>
        <PrimaryButton
          title="Revisar minhas reflexões"
          onPress={() => navigation.navigate('Review')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.sm },
  subtitle: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconDone: {
    color: colors.accent,
    fontSize: 14,
    marginTop: 3,
    width: 20,
  },
  iconSkipped: {
    color: colors.placeholder,
    fontSize: 14,
    marginTop: 3,
    width: 20,
  },
  rowText: { flex: 1 },
  ordinal: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  name: {
    ...typography.body,
    color: colors.primaryText,
    lineHeight: 22,
  },
  nameSkipped: {
    color: colors.secondaryText,
  },
  skippedLabel: {
    ...typography.small,
    color: colors.placeholder,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  actions: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
