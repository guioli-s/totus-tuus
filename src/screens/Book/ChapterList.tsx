import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, FlatList } from 'react-native';
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

  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchResults = useMemo(() => {
    if (searchQuery.length < 3) return [];
    const query = searchQuery.toLowerCase();
    
    return bookData
      .map((item: any, index: number) => {
        const textToSearch = typeof item === 'string' ? item : Object.values(item).join(' ');
        return { item, index, textToSearch, match: textToSearch.toLowerCase().includes(query) };
      })
      .filter((res: any) => res.match);
  }, [searchQuery, bookData]);

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
        <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchModalVisible(true); }} style={styles.searchIconBtn}>
          <Feather name="search" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Selecione a seção ou capítulo:</Text>
        
        <View style={styles.grid}>
          {bookData.map((item: any, index: number) => renderChapterBox(item, index))}
        </View>
      </ScrollView>

      {/* Modal de Pesquisa */}
      <Modal visible={isSearchModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSearchModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.closeSearchBtn}>
              <Feather name="x" size={24} color={colors.primaryText} />
            </TouchableOpacity>
            <View style={styles.searchInputContainer}>
              <Feather name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Pesquisar em ${bookTitles[bookId]}...`}
                placeholderTextColor={colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Feather name="x-circle" size={18} color={colors.secondaryText} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.index.toString()}
            contentContainerStyle={styles.searchResultsContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              searchQuery.length >= 3 ? (
                <Text style={styles.emptyText}>Nenhum trecho encontrado.</Text>
              ) : (
                <Text style={styles.emptyText}>Digite pelo menos 3 letras para buscar.</Text>
              )
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem} 
                onPress={() => {
                  setSearchModalVisible(false);
                  navigation.navigate('BookReader', { bookId, index: item.index });
                }}
              >
                <Text style={styles.searchResultTitle}>
                  {item.index === 0 ? 'Prólogo' : `Seção / Capítulo ${item.index}`}
                </Text>
                <Text style={styles.searchResultSnippet} numberOfLines={3}>
                  {item.textToSearch}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
  searchIconBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  closeSearchBtn: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.primaryText,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: spacing.xs,
  },
  searchResultsContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  searchResultItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  searchResultTitle: {
    ...typography.subtitle,
    color: colors.accent,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  searchResultSnippet: {
    ...typography.body,
    color: colors.secondaryText,
  },
  emptyText: {
    ...typography.body,
    color: colors.placeholder,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
