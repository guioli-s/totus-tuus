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

/**
 * Returns a flat navigable array for each book type.
 * - catecismo: entries array from the JSON
 * - compendium: questions array from the JSON
 * - tratado: the JSON itself (already a flat array)
 */
function getBookItems(bookId: string): any[] {
  const raw = booksData[bookId as keyof typeof booksData];
  if (bookId === 'catecismo') {
    return raw.entries ?? [];
  }
  if (bookId === 'compendium') {
    return raw.questions ?? [];
  }
  // tratado is already a flat array
  return raw;
}

/**
 * Recursively extract text content from a catecismo "structure" array.
 * Each element in structure can be:
 *   - { text: "..." } — a title or heading
 *   - { paragraph_number: N, content: "..." } — a numbered paragraph
 *   - { type: "part"|"section"|"chapter"|"article", title: "...", children: [...] }
 */
function extractTextFromStructure(structure: any[]): string[] {
  const result: string[] = [];
  for (const node of structure) {
    if (node.title) {
      result.push(node.title);
    }
    if (node.text) {
      result.push(node.text);
    }
    if (node.content) {
      const prefix = node.paragraph_number ? `§${node.paragraph_number}. ` : '';
      result.push(prefix + node.content);
    }
    if (node.children && Array.isArray(node.children)) {
      result.push(...extractTextFromStructure(node.children));
    }
  }
  return result;
}

/**
 * Parse the catecismo entry content field.
 * The content field is a JSON string containing { source_file, url, structure: [...] }
 */
function parseCatecismoContent(entry: any): string[] {
  if (!entry?.content) return [];
  try {
    const parsed = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
    if (parsed.structure && Array.isArray(parsed.structure)) {
      return extractTextFromStructure(parsed.structure);
    }
    // Fallback: if content is already a plain string
    return [typeof parsed === 'string' ? parsed : JSON.stringify(parsed)];
  } catch {
    // If JSON parsing fails, treat as plain text
    return [String(entry.content)];
  }
}

/**
 * Extract readable content from a compendium question entry.
 * Each question has: { question, answer, references }
 */
function parseCompendiumContent(entry: any): string[] {
  const result: string[] = [];
  if (entry?.question) {
    result.push(entry.question);
  }
  if (entry?.answer && entry.answer.trim() !== '') {
    result.push(entry.answer);
  }
  if (entry?.references && Array.isArray(entry.references) && entry.references.length > 0) {
    result.push('Referências: ' + entry.references.join('; '));
  }
  return result;
}

type Props = NativeStackScreenProps<RootStackParamList, 'BookReader'>;

export function BookReaderScreen({ route, navigation }: Props) {
  const { bookId, index: initialIndex } = route.params;
  const { colors, spacing, typography, radius, shadow } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius, shadow), [colors, spacing, typography, radius, shadow]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

  const bookItems = useMemo(() => getBookItems(bookId), [bookId]);
  const currentItem = bookItems[currentIndex];

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < bookItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Helper to render content based on book type and structure
  const renderContent = () => {
    if (!currentItem) return null;

    if (bookId === 'catecismo') {
      const paragraphs = parseCatecismoContent(currentItem);
      return paragraphs.map((p: string, i: number) => (
        <Text key={i} style={styles.paragraph}>{p}</Text>
      ));
    }

    if (bookId === 'compendium') {
      const paragraphs = parseCompendiumContent(currentItem);
      return paragraphs.map((p: string, i: number) => {
        // First paragraph is the question — render with a distinct style
        if (i === 0) {
          return (
            <View key={i} style={styles.questionContainer}>
              <Text style={styles.questionNumber}>Pergunta {currentItem.number}</Text>
              <Text style={styles.questionText}>{p}</Text>
            </View>
          );
        }
        return <Text key={i} style={styles.paragraph}>{p}</Text>;
      });
    }

    // Tratado uses content: string
    if (typeof currentItem.content === 'string') {
      return currentItem.content.split('\n').filter((p: string) => p.trim() !== '').map((p: string, i: number) => (
        <Text key={i} style={styles.paragraph}>{p.trim()}</Text>
      ));
    }

    // Fallback for content as string[]
    if (Array.isArray(currentItem.content)) {
      return currentItem.content.map((p: string, i: number) => (
        <Text key={i} style={styles.paragraph}>{p}</Text>
      ));
    }

    return null;
  };

  const getTitle = () => {
    if (!currentItem) return 'Estudo';
    
    if (bookId === 'catecismo') {
      // Try to extract a meaningful title from the entry
      if (currentItem.paragraph_number) {
        return `CCC §${currentItem.paragraph_number}`;
      }
      return currentItem.id || 'Catecismo';
    }

    if (bookId === 'compendium') {
      return `Compêndio §${currentItem.number ?? currentIndex + 1}`;
    }
    
    if (bookId === 'tratado') return currentItem.chapter || 'Tratado';
    
    // Fallback
    return currentItem.file?.replace(/(_po)?\.html$/, '').replace(/_/g, ' ') || 'Estudo';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{getTitle()}</Text>
          <Text style={styles.headerSubtitle}>{currentIndex + 1} de {bookItems.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${((currentIndex + 1) / bookItems.length) * 100}%` }]} />
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
            style={[styles.navBtn, currentIndex === bookItems.length - 1 && styles.disabledBtn]} 
            onPress={handleNext}
            disabled={currentIndex === bookItems.length - 1}
          >
            <Text style={[styles.navBtnText, currentIndex === bookItems.length - 1 && { color: colors.placeholder }]}>Próximo</Text>
            <Feather name="arrow-right" size={20} color={currentIndex === bookItems.length - 1 ? colors.placeholder : colors.accent} />
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
  questionContainer: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  questionNumber: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  questionText: {
    ...typography.body,
    color: colors.primaryText,
    lineHeight: 28,
    fontWeight: '600',
    fontStyle: 'italic',
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
