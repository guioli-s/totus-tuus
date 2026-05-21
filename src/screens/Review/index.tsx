import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Divider } from '../../components/Divider';
import { commandments } from '../../content/commandments';
import { useExamenStore, ConfessionEntry } from '../../store/useExamenStore';
import { clearAllReflections, saveConfessionList, deleteSession, saveExamToHistory } from '../../database';
import { ReflexaoStackParamList } from '../../navigation/ReflexaoNavigator';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ReflexaoStackParamList, 'Review'>;

export function ReviewScreen({ navigation }: Props) {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const reflections = useExamenStore((s) => s.reflections);
  const clearReflections = useExamenStore((s) => s.clearReflections);
  const setFinalConfessionList = useExamenStore((s) => s.setFinalConfessionList);
  const endSession = useExamenStore((s) => s.endSession);

  const { colors, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography), [colors, spacing, typography]);

  const sinnedCommandments = commandments.filter(
    (c) => reflections[c.id]?.sinned === true
  );
  const notSinnedCommandments = commandments.filter(
    (c) => reflections[c.id]?.sinned !== true
  );

  const handleEdit = (commandmentId: number) => {
    // Push commandment em modo edição — goBack() retorna à revisão
    navigation.push('Commandment', { commandmentId, returnToReview: true });
  };

  const handleFinalize = async () => {
    const entries: ConfessionEntry[] = sinnedCommandments.map((c) => ({
      commandmentId: c.id,
      commandmentTitle: c.title,
      reflection: reflections[c.id]?.reflectionText ?? '',
    }));

    await Promise.all([
      saveExamToHistory(reflections),
      saveConfessionList(entries),
      clearAllReflections(),
      deleteSession(),
    ]);

    setFinalConfessionList(entries);
    clearReflections();
    endSession();

    // Reset limpo da stack — garante que ao voltar à aba aparece o Hub (não os mandamentos)
    navigation.reset({ index: 0, routes: [{ name: 'ReflexaoHub' }] });
    rootNav.navigate('Confissao');
  };

  return (
    <ScreenContainer scrollable>
      <Title style={styles.title}>Revisão</Title>
      <Paragraph style={styles.subtitle}>
        Revise seu exame antes de finalizar.
        Toque em <Text style={styles.highlight}>editar</Text> para reconsiderar qualquer item.
      </Paragraph>

      {/* ─── LISTA 1: Pecados identificados ─── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pecados identificados</Text>
        <Text style={styles.sectionCount}>{sinnedCommandments.length}</Text>
      </View>

      {sinnedCommandments.length === 0 ? (
        <Paragraph style={styles.empty}>
          Não foram identificados pecados diante dos mandamentos.
        </Paragraph>
      ) : (
        sinnedCommandments.map((c, index) => {
          const entry = reflections[c.id];
          const hasText = entry?.reflectionText?.trim().length > 0;
          return (
            <View key={c.id}>
              <View style={styles.entryRow}>
                <View style={styles.entryInfo}>
                  <Text style={styles.ordinal}>{c.id}º</Text>
                  <Text style={styles.entryTitle}>{c.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleEdit(c.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.editBtn}>editar</Text>
                </TouchableOpacity>
              </View>
              {hasText && (
                <Text style={styles.reflectionText}>{entry.reflectionText}</Text>
              )}
              {index < sinnedCommandments.length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          );
        })
      )}

      <Divider />

      {/* ─── LISTA 2: Não pecou contra ─── */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, styles.sectionTitleMuted]}>
          Não identificou pecado.
        </Text>
        <Text style={[styles.sectionCount, styles.sectionCountMuted]}>
          {notSinnedCommandments.length}
        </Text>
      </View>

      {notSinnedCommandments.length === 0 ? (
        <Paragraph style={styles.empty}>—</Paragraph>
      ) : (
        notSinnedCommandments.map((c, index) => (
          <View key={c.id}>
            <View style={styles.entryRow}>
              <View style={styles.entryInfo}>
                <Text style={[styles.ordinal, styles.ordinalMuted]}>{c.id}º</Text>
                <Text style={[styles.entryTitle, styles.entryTitleMuted]}>
                  {c.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleEdit(c.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.editBtn}>editar</Text>
              </TouchableOpacity>
            </View>
            {index < notSinnedCommandments.length - 1 && (
              <View style={styles.itemDivider} />
            )}
          </View>
        ))
      )}

      <View style={styles.actions}>
        <PrimaryButton title="Finalizar" onPress={handleFinalize} />
      </View>
    </ScreenContainer>
  );
}

const getStyles = (colors: any, spacing: any, typography: any) => StyleSheet.create({
  title: { marginBottom: spacing.sm },
  subtitle: { marginBottom: spacing.xl, lineHeight: 24 },
  highlight: { color: colors.accent },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.primaryText,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  sectionTitleMuted: { color: colors.secondaryText },
  sectionCount: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '600',
  },
  sectionCountMuted: { color: colors.placeholder },

  empty: { fontStyle: 'italic', marginBottom: spacing.md },

  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  entryInfo: { flex: 1 },
  ordinal: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  ordinalMuted: { color: colors.placeholder },
  entryTitle: {
    ...typography.body,
    color: colors.primaryText,
    lineHeight: 22,
  },
  entryTitleMuted: { color: colors.secondaryText },
  editBtn: {
    ...typography.small,
    color: colors.accent,
    paddingTop: 2,
  },
  reflectionText: {
    ...typography.body,
    color: colors.secondaryText,
    lineHeight: 26,
    paddingBottom: spacing.sm,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  actions: { marginTop: spacing.xl, paddingBottom: spacing.xxl },
});
