import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';
import { BackButton } from '../../components/BackButton';

const { width } = Dimensions.get('window');

// Load data
const booksData = {
  catecismo: require('../../content/catechism/catecismo_igreja_catolica.json'),
  compendium: require('../../content/catechism/compendium_igreja_catolica.json'),
  tratado: require('../../content/devotion/tratado_verdadeira_devocao.json'),
};

type Props = NativeStackScreenProps<RootStackParamList, 'BookReader'>;

export function BookReaderScreen({ route, navigation }: Props) {
  const { bookId, index: initialIndex } = route.params;
  const { colors, spacing, typography, radius, shadow } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius, shadow), [colors, spacing, typography, radius, shadow]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  const bookData = booksData[bookId];
  const currentItem = bookData[currentIndex];

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < bookData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Helper to render content based on structure
  const renderContent = () => {
    if (!currentItem) return null;

    // Catecismo and Compendium use content: string[]
    if (Array.isArray(currentItem.content)) {
      return currentItem.content.map((p: string, i: number) => (
        <Text key={i} style={styles.paragraph}>{p}</Text>
      ));
    }
    
    // Tratado uses content: string
    if (typeof currentItem.content === 'string') {
      return currentItem.content.split('\n').filter(p => p.trim() !== '').map((p: string, i: number) => (
        <Text key={i} style={styles.paragraph}>{p.trim()}</Text>
      ));
    }

    return null;
  };

  const getTitle = () => {
    if (!currentItem) return 'Estudo';
    if (bookId === 'tratado') return currentItem.chapter || 'Tratado';
    
    // For Catecismo/Compendium, try to use the first line of content if it looks like a title
    if (Array.isArray(currentItem.content) && currentItem.content.length > 0) {
      const firstLine = currentItem.content[0];
      if (firstLine.length < 50 && firstLine === firstLine.toUpperCase()) {
        return firstLine;
      }
    }
    
    // Fallback to formatted filename
    return currentItem.file?.replace(/(_po)?\.html$/, '').replace(/_/g, ' ') || 'Estudo';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{getTitle()}</Text>
          <Text style={styles.headerSubtitle}>{currentIndex + 1} de {bookData.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${((currentIndex + 1) / bookData.length) * 100}%` }]} />
      </View>

      <ScrollView 
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          {renderContent()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.footerNav}>
          <TouchableOpacity 
            style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]} 
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Feather name="arrow-left" size={20} color={currentIndex === 0 ? colors.placeholder : colors.accent} />
            <Text style={[styles.navBtnText, currentIndex === 0 && { color: colors.placeholder }]}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navBtn, currentIndex === bookData.length - 1 && styles.disabledBtn]} 
            onPress={handleNext}
            disabled={currentIndex === bookData.length - 1}
          >
            <Text style={[styles.navBtnText, currentIndex === bookData.length - 1 && { color: colors.placeholder }]}>Próximo</Text>
            <Feather name="arrow-right" size={20} color={currentIndex === bookData.length - 1 ? colors.placeholder : colors.accent} />
          </TouchableOpacity>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.primaryText,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    ...typography.small,
    color: colors.secondaryText,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: colors.divider,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.subtle,
  },
  paragraph: {
    ...typography.body,
    color: colors.primaryText,
    lineHeight: 28,
    marginBottom: spacing.md,
    textAlign: 'justify',
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    ...shadow.subtle,
    gap: spacing.xs,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  navBtnText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '600',
  },
});
