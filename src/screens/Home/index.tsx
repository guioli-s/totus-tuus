import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Divider } from '../../components/Divider';
import { useExamenStore } from '../../store/useExamenStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { commandments } from '../../content/commandments';
import { VERSES } from '../../content/dailyContent';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';
import { getDailyBibleVerse, DailyBibleVerse } from '../../services/DailyVerseService';

function EyeIcon({ hidden, colors }: { hidden: boolean; colors: any }) {
  return (
    <Feather name={hidden ? "eye-off" : "eye"} size={20} color={colors.primaryText} />
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const session = useExamenStore((s) => s.session);
  const reflections = useExamenStore((s) => s.reflections);
  const finalConfessionList = useExamenStore((s) => s.finalConfessionList);

  const { dailyVerseId, dailyPurpose, dailyCompleted, dailyAdapted, completeDailyPurpose } = useSettingsStore();

  const { colors, spacing, typography, radius, shadow } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius, shadow), [colors, spacing, typography, radius, shadow]);

  const [isConfessionHidden, setIsConfessionHidden] = useState(false);
  const [bibleVerse, setBibleVerse] = useState<DailyBibleVerse | null>(null);

  // Carrega o versículo diário da Bíblia Católica completa
  useEffect(() => {
    getDailyBibleVerse(new Date()).then(setBibleVerse).catch(console.error);
  }, []);

  const completedCount = Object.values(reflections).filter((e) => e.sinned || e.skipped).length;

  const handleContinue = () => {
    navigation.navigate('Reflexao', {
      screen: 'Commandment',
      params: { commandmentId: session!.currentCommandmentId },
    });
  };

  const handleStart = () => {
    navigation.navigate('Reflexao', { screen: 'ReflexaoHub' });
  };

  const actions = [
    {
      id: 'exame',
      title: 'Exame',
      icon: 'edit-3',
      onPress: handleStart,
    },
    {
      id: 'oracoes',
      title: 'Orações',
      icon: 'heart',
      onPress: () => navigation.navigate('Oracoes', {}),
    },
    {
      id: 'confissao',
      title: 'Confissão',
      icon: 'list',
      onPress: () => navigation.navigate('Confissao'),
    },
    {
      id: 'biblia',
      title: 'Bíblia',
      icon: 'book-open',
      onPress: () => navigation.navigate('Biblia'),
    },
    {
      id: 'estudos',
      title: 'Estudos',
      icon: 'bookmark',
      onPress: () => navigation.navigate('Estudos'),
    },
    {
      id: 'tratado',
      title: 'Tratado',
      icon: 'feather',
      onPress: () => navigation.navigate('BookChapters', { bookId: 'tratado' }),
    },
    {
      id: 'ajustes',
      title: 'Ajustes',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Title style={styles.pageTitle}>Início</Title>
        <View style={styles.gap} />



        <View style={styles.gap} />

        {/* ─── Versículo Diário da Bíblia Católica ─── */}
        {bibleVerse && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>Versículo do Dia</Text>
                <Feather name="book-open" size={16} color={colors.accent} />
              </View>
              <Text style={styles.verseText}>"{bibleVerse.text}"</Text>
              <Text style={styles.verseRef}>— {bibleVerse.reference}</Text>
            </View>
            <View style={styles.gap} />
          </>
        )}

        {/* ─── Propósito e Versículo Temático ─── */}
        {dailyVerseId !== 0 && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>Reflexão Temática</Text>
              </View>
              {dailyAdapted && (
                <Text style={styles.adaptedLabel}>Sugestão baseada no seu momento atual</Text>
              )}
              <Text style={styles.verseText}>"{VERSES.find(v => v.id === dailyVerseId)?.text}"</Text>
              <Text style={styles.verseRef}>— {VERSES.find(v => v.id === dailyVerseId)?.reference}</Text>
            </View>

            <View style={styles.gap} />

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>Propósito de Hoje</Text>
                {dailyCompleted && <Feather name="check-circle" size={20} color={colors.accent} />}
              </View>
              <Paragraph style={styles.purposeText}>
                {dailyPurpose}
              </Paragraph>
              <View style={styles.cardActions}>
                <PrimaryButton 
                  title={dailyCompleted ? "Propósito Concluído" : "Vivi isso hoje"} 
                  onPress={dailyCompleted ? () => {} : completeDailyPurpose} 
                  disabled={dailyCompleted}
                  style={dailyCompleted ? styles.completedButton : undefined}
                  textStyle={dailyCompleted ? styles.completedButtonText : undefined}
                />
              </View>
            </View>
            
            <View style={styles.gap} />
          </>
        )}


      </ScrollView>

      {/* ─── Fixed Grid de Ações ─── */}
      <View style={[styles.fixedActionsCard, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.gridContainer}>
          {actions.map((action) => (
            <View key={action.id} style={styles.actionWrapper}>
              <TouchableOpacity
                style={styles.gridItem}
                activeOpacity={0.7}
                onPress={action.onPress}
              >
                <Feather name={action.icon as any} size={24} color={colors.primaryText} />
              </TouchableOpacity>
              <Text style={styles.gridText}>{action.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, spacing: any, typography: any, radius: any, shadow: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pageTitle: { marginBottom: spacing.sm },
  gap: { height: spacing.lg },

  highlightCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.subtle,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    ...typography.small,
    color: colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  sessionInfo: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  cardActions: { marginTop: spacing.sm },
  adaptedLabel: {
    ...typography.small,
    fontSize: 10,
    color: colors.secondaryText,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },

  verseText: {
    ...typography.body,
    fontStyle: 'italic',
    color: colors.primaryText,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  verseRef: {
    ...typography.small,
    color: colors.accent,
    textAlign: 'right',
    fontWeight: '600',
  },
  purposeText: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 22,
    color: colors.primaryText,
  },
  completedButton: {
    backgroundColor: colors.background,
    borderColor: colors.accent,
    borderWidth: 1,
  },
  completedButtonText: {
    color: colors.accent,
  },

  fixedActionsCard: {
    backgroundColor: colors.inputBackground,
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.subtle,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: spacing.lg,
    columnGap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  actionWrapper: {
    alignItems: 'center',
    width: '21.5%', // Ajustado para 4 por linha com gap fixo (não justificado)
  },
  gridItem: {
    backgroundColor: colors.surface,
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.subtle,
    elevation: 2,
    marginBottom: spacing.xs,
  },
  gridText: {
    ...typography.small,
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },

  hiddenPlaceholder: {
    ...typography.body,
    color: colors.placeholder,
    letterSpacing: 4,
    marginTop: spacing.sm,
  },
  empty: { fontStyle: 'italic', marginTop: spacing.sm },
  confessionItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  confessionOrdinal: {
    ...typography.small,
    color: colors.secondaryText,
    minWidth: 24,
  },
  confessionTitle: {
    ...typography.small,
    color: colors.primaryText,
    flex: 1,
    lineHeight: 20,
  },
});
