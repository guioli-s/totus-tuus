import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { Divider } from '../../components/Divider';
import { BackButton } from '../../components/BackButton';
import { useSettingsStore } from '../../store/useSettingsStore';
import { saveSettingsToDB } from '../../database';
import { useAppTheme } from '../../theme';

export function SettingsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const textScale = useSettingsStore((s) => s.textScale);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setTextScale = useSettingsStore((s) => s.setTextScale);

  const { colors, spacing, typography, radius } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius), [colors, spacing, typography, radius]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    saveSettingsToDB({ theme: newTheme, textScale }).catch(console.error);
  };

  const handleScaleChange = (newScale: 'small' | 'medium' | 'large') => {
    setTextScale(newScale);
    saveSettingsToDB({ theme, textScale: newScale }).catch(console.error);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <BackButton />
        <Title style={styles.pageTitle}>Configurações</Title>
      </View>
      <Paragraph style={styles.subtitle}>
        Ajuste as preferências de leitura e visualização.
      </Paragraph>
      <View style={styles.gap} />

      <Text style={styles.sectionTitle}>Tamanho do Texto</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.optionBtn, textScale === 'small' && styles.optionBtnActive]}
          onPress={() => handleScaleChange('small')}
        >
          <Text style={[styles.optionText, textScale === 'small' && styles.optionTextActive]}>A- (Pequeno)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionBtn, textScale === 'medium' && styles.optionBtnActive]}
          onPress={() => handleScaleChange('medium')}
        >
          <Text style={[styles.optionText, textScale === 'medium' && styles.optionTextActive]}>A (Padrão)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionBtn, textScale === 'large' && styles.optionBtnActive]}
          onPress={() => handleScaleChange('large')}
        >
          <Text style={[styles.optionText, textScale === 'large' && styles.optionTextActive]}>A+ (Grande)</Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <Text style={styles.sectionTitle}>Tema Visual</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.optionBtn, styles.themeBtn, theme === 'light' && styles.optionBtnActive]}
          onPress={() => handleThemeChange('light')}
        >
          <Feather name="sun" size={20} color={theme === 'light' ? colors.accent : colors.secondaryText} />
          <Text style={[styles.optionText, theme === 'light' && styles.optionTextActive]}>Claro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionBtn, styles.themeBtn, theme === 'dark' && styles.optionBtnActive]}
          onPress={() => handleThemeChange('dark')}
        >
          <Feather name="moon" size={20} color={theme === 'dark' ? colors.accent : colors.secondaryText} />
          <Text style={[styles.optionText, theme === 'dark' && styles.optionTextActive]}>Escuro</Text>
        </TouchableOpacity>
      </View>

    </ScreenContainer>
  );
}

const getStyles = (colors: any, spacing: any, typography: any, radius: any) => StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pageTitle: { marginBottom: 0 },
  subtitle: { marginBottom: spacing.sm, lineHeight: 22 },
  gap: { height: spacing.lg },

  sectionTitle: {
    ...typography.subtitle,
    color: colors.primaryText,
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  optionBtn: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  themeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  optionBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '1A', // 10% opacity
  },
  optionText: {
    ...typography.body,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});
