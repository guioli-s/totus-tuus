import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';
import { BackButton } from '../../components/BackButton';
import { Title } from '../../components/Title';

const booksData = {
  catecismo: require('../../content/catechism/catecismo_igreja_catolica.json'),
  compendium: require('../../content/catechism/compendium_igreja_catolica.json'),
  tratado: require('../../content/devotion/tratado_verdadeira_devocao.json'),
};

const bookTitles = {
  catecismo: 'Catecismo',
  compendium: 'Compêndio',
  tratado: 'Tratado da Devoção',
};

type Props = NativeStackScreenProps<RootStackParamList, 'BookChapters'>;

export function BookChaptersScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const { colors, spacing, typography, radius, shadow } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius, shadow), [colors, spacing, typography, radius, shadow]);

  const bookData = booksData[bookId];

  const renderChapterBox = (item: any, index: number) => {
    let label = index.toString();
    
    if (index === 0) {
      label = 'Prólogo';
    } else if (bookId === 'tratado' && index === bookData.length - 1) {
      label = 'Apêndice';
    }
    
    const isTextLabel = isNaN(Number(label));
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.chapterBox}
        onPress={() => navigation.navigate('BookReader', { bookId, index })}
      >
        <Text 
          style={[
            styles.chapterBoxText, 
            isTextLabel && { fontSize: 10, textTransform: 'uppercase' }
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Title style={styles.title}>{bookTitles[bookId]}</Title>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Selecione a seção ou capítulo:</Text>
        
        <View style={styles.grid}>
          {bookData.map((item: any, index: number) => renderChapterBox(item, index))}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  title: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.secondaryText,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: spacing.md,
    columnGap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  chapterBox: {
    width: '21.5%', // Ajustado para caber 4 por linha com gap fixo (não justificado)
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadow.subtle,
  },
  chapterBoxText: {
    fontSize: typography.body.fontSize,
    color: colors.primaryText,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
