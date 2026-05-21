import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { BackButton } from '../../components/BackButton';
import { prayers } from '../../content/prayers';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Oracoes'>;

export function OracoesScreen({ route }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    route.params?.expandPrayerId ?? null
  );

  const { colors, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography), [colors, spacing, typography]);

  useEffect(() => {
    if (route.params?.expandPrayerId) {
      setExpandedId(route.params.expandPrayerId);
    }
  }, [route.params?.expandPrayerId]);

  const toggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <BackButton />
        <Title style={styles.pageTitle}>Orações</Title>
      </View>
      <Paragraph style={styles.subtitle}>
        Rezar antes e depois da confissão prepara o coração.
      </Paragraph>

      <View style={styles.gap} />

      {prayers.map((prayer, index) => {
        const isOpen = expandedId === prayer.id;
        const isLast = index === prayers.length - 1;

        return (
          <View key={prayer.id} style={[styles.item, isLast && styles.itemLast]}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => toggle(prayer.id)}
              activeOpacity={0.7}
            >
              <View style={styles.headerLeft}>
                <Text style={[styles.itemOrdinal, isOpen && styles.itemOrdinalActive]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.itemTitle, isOpen && styles.itemTitleActive]}>
                  {prayer.title}
                </Text>
              </View>
              <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>
                {isOpen ? '∧' : '∨'}
              </Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.body}>
                <Text style={styles.prayerText}>{prayer.text}</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const getStyles = (colors: any, spacing: any, typography: any) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pageTitle: { marginBottom: 0 },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.secondaryText,
  },
  gap: { height: spacing.lg },

  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    flex: 1,
  },
  itemOrdinal: {
    ...typography.small,
    color: colors.placeholder,
    minWidth: 18,
  },
  itemOrdinalActive: {
    color: colors.accent,
  },
  itemTitle: {
    ...typography.body,
    color: colors.secondaryText,
    fontWeight: '500',
    lineHeight: 22,
    flex: 1,
  },
  itemTitleActive: {
    color: colors.primaryText,
  },
  chevron: {
    ...typography.small,
    color: colors.placeholder,
    fontSize: 12,
    marginLeft: spacing.md,
  },
  chevronOpen: {
    color: colors.accent,
  },
  body: {
    paddingBottom: spacing.xl,
  },
  prayerText: {
    ...typography.body,
    color: colors.primaryText,
    lineHeight: 30,
    letterSpacing: 0.2,
  },
});
