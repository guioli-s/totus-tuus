import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';

export function EstudosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, spacing, typography, radius, shadow } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius, shadow), [colors, spacing, typography, radius, shadow]);

  const options = [
    {
      id: 'catecismo',
      title: 'Catecismo da Igreja Católica',
      description: 'A exposição completa e íntegra da doutrina católica.',
      icon: 'book',
      color: '#C8A96A',
    },
    {
      id: 'compendium',
      title: 'Compêndio do Catecismo',
      description: 'Uma síntese fiel e segura do Catecismo em forma de diálogo.',
      icon: 'layers',
      color: '#A0A0A0',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Title>Estudos</Title>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Paragraph style={styles.intro}>
          Aprofunde seus conhecimentos sobre a Fé e a Doutrina da Igreja através dos textos oficiais.
        </Paragraph>

        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('BookChapters', { bookId: opt.id as any });
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: opt.color + '20' }]}>
              <Feather name={opt.icon as any} size={32} color={opt.color} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{opt.title}</Text>
              <Text style={styles.cardDescription}>{opt.description}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, spacing: any, typography: any, radius: any, shadow: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
  },
  intro: {
    marginBottom: spacing.xl,
    color: colors.secondaryText,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.subtle,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.small,
    color: colors.secondaryText,
    lineHeight: 18,
  },
});
