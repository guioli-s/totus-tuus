import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { Divider } from '../../components/Divider';
import { Feather } from '@expo/vector-icons';
import { commandments } from '../../content/commandments';
import { useExamenStore } from '../../store/useExamenStore';
import { saveSkipped, saveSession, markSinnedInDB } from '../../database';
import { ReflexaoStackParamList } from '../../navigation/ReflexaoNavigator';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ReflexaoStackParamList, 'Commandment'>;

export function CommandmentScreen({ route, navigation }: Props) {
  const { commandmentId, returnToReview = false } = route.params;
  const commandment = commandments.find((c) => c.id === commandmentId);
  const total = commandments.length;

  const skipCommandment = useExamenStore((s) => s.skipCommandment);
  const endSession = useExamenStore((s) => s.endSession);
  const markSinned = useExamenStore((s) => s.markSinned);
  const setSessionCommandment = useExamenStore((s) => s.setSessionCommandment);

  const { colors, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography), [colors, spacing, typography]);

  // Avança para o próximo mandamento ou para a revisão
  const goNext = useCallback(() => {
    if (commandmentId < total) {
      const next = commandmentId + 1;
      setSessionCommandment(next);
      saveSession(next).catch(console.error);
      navigation.push('Commandment', { commandmentId: next });
    } else {
      navigation.navigate('Review');
    }
  }, [commandmentId, total, navigation, setSessionCommandment]);

  // "Eu pequei" — marca sinned imediatamente e vai para escrita
  const handleSinned = useCallback(() => {
    markSinned(commandmentId);
    markSinnedInDB(commandmentId).catch(console.error);
    setSessionCommandment(commandmentId);
    saveSession(commandmentId).catch(console.error);
    navigation.navigate('Reflection', { commandmentId, returnToReview });
  }, [commandmentId, navigation, markSinned, setSessionCommandment, returnToReview]);

  // "Não pequei" — marca skipped e avança (ou volta para revisão se editando)
  const handleSkip = useCallback(() => {
    skipCommandment(commandmentId);
    saveSkipped(commandmentId).catch(console.error);
    if (returnToReview) {
      navigation.goBack(); // volta para a revisão
    } else {
      goNext();
    }
  }, [commandmentId, skipCommandment, returnToReview, goNext, navigation]);

  if (!commandment) return null;

  const handleSaveAndExit = () => {
    // A sessão permanece ativa na store e no DB, o que efetivamente "salva" o progresso.
    // Navegamos para a aba Home principal.
    (navigation as any).navigate('Home');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={handleSaveAndExit} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="x" size={26} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: mostra contexto diferente se estiver em modo edição */}
        {returnToReview && (
          <Text style={styles.editBadge}>Editando mandamento</Text>
        )}

        <View style={styles.header}>
          <Text style={styles.ordinal}>{commandmentId}º mandamento</Text>
          <Title style={styles.title}>{commandment.title}</Title>
        </View>

        <Paragraph style={styles.description}>{commandment.description}</Paragraph>
        <Divider />

        <Text style={styles.hint}>
          Os exemplos abaixo são apenas guias para seu exame.
        </Text>

        <View style={styles.questions}>
          {commandment.questions.map((question, index) => (
            <View key={index} style={styles.questionRow}>
              <Text style={styles.bullet}>—</Text>
              <Text style={styles.questionText}>{question}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.fixedActions}>
        <PrimaryButton
          title="Eu pequei contra este mandamento"
          onPress={handleSinned}
        />
        <SecondaryButton
          title="Não pequei contra este mandamento"
          onPress={handleSkip}
        />
        {/* Voltar — oculta no primeiro mandamento do fluxo normal */}
        {(commandmentId > 1 || returnToReview) && (
          <SecondaryButton
            title="Voltar"
            onPress={() => navigation.goBack()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, spacing: any, typography: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  fixedActions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  editBadge: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.lg,
  },
  header: { marginBottom: spacing.lg },
  ordinal: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.sm,
  },
  title: { lineHeight: 34 },
  description: { lineHeight: 26 },
  hint: {
    ...typography.small,
    color: colors.placeholder,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  questions: { gap: spacing.lg, marginBottom: spacing.xl },
  questionRow: { flexDirection: 'row', gap: spacing.md },
  bullet: { color: colors.accent, ...typography.body, marginTop: 1 },
  questionText: {
    ...typography.body,
    color: colors.primaryText,
    flex: 1,
    lineHeight: 26,
  },
});
