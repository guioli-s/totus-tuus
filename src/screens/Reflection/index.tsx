import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextArea } from '../../components/TextArea';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { BackButton } from '../../components/BackButton';
import { commandments } from '../../content/commandments';
import { useExamenStore } from '../../store/useExamenStore';
import { saveReflection, saveSession } from '../../database';
import { ReflexaoStackParamList } from '../../navigation/ReflexaoNavigator';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ReflexaoStackParamList, 'Reflection'>;

export function ReflectionScreen({ route, navigation }: Props) {
  const { commandmentId, returnToReview = false } = route.params;
  const commandment = commandments.find((c) => c.id === commandmentId);
  const total = commandments.length;

  const storedEntry = useExamenStore((s) => s.reflections[commandmentId]);
  const setReflection = useExamenStore((s) => s.setReflection);
  const setSessionCommandment = useExamenStore((s) => s.setSessionCommandment);

  const { colors, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography), [colors, spacing, typography]);

  const [text, setText] = useState(storedEntry?.reflectionText ?? '');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save silencioso (texto pode ser vazio — sinned já foi marcado)
  const handleSave = useCallback(() => {
    setReflection(commandmentId, text);
    saveReflection(commandmentId, text).catch(console.error);
  }, [commandmentId, text, setReflection]);

  const handleContinue = useCallback(() => {
    handleSave();
    if (returnToReview) {
      // Volta direto para a revisão após editar
      navigation.navigate('Review');
    } else if (commandmentId < total) {
      const next = commandmentId + 1;
      setSessionCommandment(next);
      saveSession(next).catch(console.error);
      navigation.navigate('Commandment', { commandmentId: next });
    } else {
      navigation.navigate('Review');
    }
  }, [commandmentId, total, navigation, handleSave, setSessionCommandment, returnToReview]);

  if (!commandment) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <BackButton />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {returnToReview && (
            <Text style={styles.editBadge}>Editando exame de consciência</Text>
          )}
          <Text style={styles.ordinal}>{commandmentId}º mandamento</Text>
          <Text style={styles.commandmentTitle}>{commandment.title}</Text>

          <Text style={styles.hint}>
            Escreva o que vier ao coração. Pode deixar em branco.
          </Text>

          <TextArea
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onBlur={handleSave}
            style={styles.textArea}
          />
          <View style={styles.spacer} />
        </ScrollView>

        <View style={styles.fixedActions}>
          <PrimaryButton
            title={returnToReview ? 'Salvar e voltar à revisão' : 'Salvar e continuar'}
            onPress={handleContinue}
          />
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, spacing: any, typography: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
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
  ordinal: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.sm,
  },
  commandmentTitle: {
    ...typography.subtitle,
    color: colors.primaryText,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  hint: {
    ...typography.small,
    color: colors.placeholder,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  textArea: { minHeight: 260 },
  spacer: { height: spacing.xl },
});
