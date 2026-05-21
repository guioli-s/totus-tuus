import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { BackButton } from '../../components/BackButton';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useSettingsStore } from '../../store/useSettingsStore';
import { saveSettingsToDB } from '../../database/db';
import { useAppTheme } from '../../theme';

// Opcional: pode ser feito lazy load, mas o Metro agrupa bem
const bibleData: any[] = require('../../content/bible/biblia.json');

type Props = NativeStackScreenProps<RootStackParamList, 'Biblia'>;

export function BibleScreen({ navigation }: Props) {
  const { colors, spacing, typography, radius } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing, typography, radius), [colors, spacing, typography, radius]);

  const { theme, textScale, lastBibleBook, lastBibleChapter, setBibleState } = useSettingsStore();

  // State para o livro e capítulo atuais
  const [currentBookIndex, setCurrentBookIndex] = useState(lastBibleBook);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(lastBibleChapter);

  // State para os modais
  const [isBookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<number | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const currentBook = bibleData[currentBookIndex];
  const currentChapter = currentBook?.capitulos[currentChapterIndex];

  const updateAndSaveState = (book: number, chapter: number) => {
    setCurrentBookIndex(book);
    setCurrentChapterIndex(chapter);
    setBibleState(book, chapter);
    saveSettingsToDB({ theme, textScale, lastBibleBook: book, lastBibleChapter: chapter }).catch(console.error);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  // Navigation handlers
  const handleNextChapter = () => {
    if (currentChapterIndex < currentBook.capitulos.length - 1) {
      updateAndSaveState(currentBookIndex, currentChapterIndex + 1);
    } else if (currentBookIndex < bibleData.length - 1) {
      updateAndSaveState(currentBookIndex + 1, 0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      updateAndSaveState(currentBookIndex, currentChapterIndex - 1);
    } else if (currentBookIndex > 0) {
      const prevBookIndex = currentBookIndex - 1;
      updateAndSaveState(prevBookIndex, bibleData[prevBookIndex].capitulos.length - 1);
    }
  };

  const openBookSelector = () => {
    setSelectedBookForChapters(null);
    setBookModalVisible(true);
  };

  const renderVerse = ({ item }: { item: any }) => (
    <View style={styles.verseContainer}>
      <Text style={styles.verseNumber}>{item.numero}</Text>
      <Text style={styles.verseText}>{item.texto}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Fixo */}
        <View style={styles.header}>
          <BackButton />
          <TouchableOpacity style={styles.selectorBtn} onPress={openBookSelector}>
            <Text style={styles.selectorText} numberOfLines={1}>
              {currentBook?.livro} {currentChapter?.capitulo}
            </Text>
            <Feather name="chevron-down" size={20} color={colors.primaryText} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Leitura */}
        <FlatList
          ref={flatListRef}
          data={currentChapter?.versiculos || []}
          keyExtractor={(item) => item.numero.toString()}
          renderItem={renderVerse}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footerNav}>
              <TouchableOpacity style={styles.navBtn} onPress={handlePrevChapter} disabled={currentBookIndex === 0 && currentChapterIndex === 0}>
                <Feather name="chevron-left" size={24} color={currentBookIndex === 0 && currentChapterIndex === 0 ? colors.placeholder : colors.accent} />
                <Text style={[styles.navBtnText, currentBookIndex === 0 && currentChapterIndex === 0 && { color: colors.placeholder }]}>Anterior</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navBtn} onPress={handleNextChapter} disabled={currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.capitulos.length - 1}>
                <Text style={[styles.navBtnText, currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.capitulos.length - 1 && { color: colors.placeholder }]}>Próximo</Text>
                <Feather name="chevron-right" size={24} color={currentBookIndex === bibleData.length - 1 && currentChapterIndex === currentBook.capitulos.length - 1 ? colors.placeholder : colors.accent} />
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>

      {/* Modal Selecionador de Livro/Capítulo */}
      <Modal visible={isBookModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBookModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => selectedBookForChapters !== null ? setSelectedBookForChapters(null) : setBookModalVisible(false)}>
              <Feather name={selectedBookForChapters !== null ? "arrow-left" : "x"} size={28} color={colors.primaryText} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedBookForChapters !== null ? bibleData[selectedBookForChapters].livro : 'Livros'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {selectedBookForChapters === null ? (
            <FlatList
              data={bibleData}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ padding: spacing.md }}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.modalListItem} onPress={() => setSelectedBookForChapters(index)}>
                  <Text style={styles.modalListText}>{item.livro}</Text>
                  <Feather name="chevron-right" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.chaptersGrid}>
              {bibleData[selectedBookForChapters].capitulos.map((cap: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chapterBox}
                  onPress={() => {
                    updateAndSaveState(selectedBookForChapters, index);
                    setBookModalVisible(false);
                  }}
                >
                  <Text style={styles.chapterBoxText}>{cap.capitulo}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any, spacing: any, typography: any, radius: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    maxWidth: '60%',
  },
  selectorText: {
    ...typography.subtitle,
    color: colors.primaryText,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  verseNumber: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
    marginRight: spacing.sm,
    marginTop: 2, // Slight adjustment for alignment
    minWidth: 20,
  },
  verseText: {
    ...typography.body,
    color: colors.primaryText,
    flex: 1,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  navBtnText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    marginHorizontal: spacing.xs,
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.title,
    color: colors.primaryText,
  },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalListText: {
    ...typography.body,
    color: colors.primaryText,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    justifyContent: 'flex-start',
    rowGap: spacing.md,
    columnGap: spacing.md,
  },
  chapterBox: {
    width: '21.5%', // 4 per row with fixed gap
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chapterBoxText: {
    fontSize: typography.body.fontSize,
    color: colors.primaryText,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
