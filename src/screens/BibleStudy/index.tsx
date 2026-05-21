import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackButton } from '../../components/BackButton';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppTheme } from '../../theme';
import { useBibleStudyStore } from '../../store/useBibleStudyStore';
import {
  checkOllamaConnection,
  checkModelAvailable,
  runBibleStudyRAG,
  getActiveProviderName,
} from '../../services/OllamaService';

type Props = NativeStackScreenProps<RootStackParamList, 'EstudoBiblico'>;

const SUGGESTION_CHIPS = [
  'O Batismo de Jesus',
  'A Última Ceia',
  'A Ressurreição',
  'Parábola do Filho Pródigo',
  'Os Dez Mandamentos',
  'A Anunciação',
  'Criação do mundo',
  'Sermão da Montanha',
];

export function BibleStudyScreen({ navigation }: Props) {
  const { colors, spacing, typography, radius, shadow } = useAppTheme();
  const styles = useMemo(
    () => getStyles(colors, spacing, typography, radius, shadow),
    [colors, spacing, typography, radius, shadow]
  );

  const {
    currentQuery,
    currentResponse,
    isGenerating,
    error,
    ollamaConnected,
    modelAvailable,
    setQuery,
    startGenerating,
    appendToken,
    finishGenerating,
    setError,
    clearCurrent,
    setConnectionStatus,
    saveToHistory,
  } = useBibleStudyStore();

  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Verifica conexão com Ollama ao entrar na tela
  useEffect(() => {
    async function checkConnection() {
      setIsCheckingConnection(true);
      const connected = await checkOllamaConnection();
      let model = false;
      if (connected) {
        model = await checkModelAvailable();
      }
      setConnectionStatus(connected, model);
      setIsCheckingConnection(false);
    }
    checkConnection();
  }, [setConnectionStatus]);

  // Auto-scroll enquanto gera
  useEffect(() => {
    if (isGenerating && scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentResponse, isGenerating]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuery.trim() || isGenerating) return;

    startGenerating();

    abortControllerRef.current = new AbortController();

    await runBibleStudyRAG(
      currentQuery.trim(),
      {
        onToken: (token) => {
          appendToken(token);
        },
        onDone: (fullText) => {
          finishGenerating(fullText);
          saveToHistory();
        },
        onError: (errorMsg) => {
          setError(errorMsg);
        },
      },
      undefined,
      abortControllerRef.current.signal
    );
  }, [currentQuery, isGenerating, startGenerating, appendToken, finishGenerating, setError, saveToHistory]);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    finishGenerating(currentResponse);
  }, [currentResponse, finishGenerating]);

  const handleNewStudy = useCallback(() => {
    clearCurrent();
  }, [clearCurrent]);

  const handleChipPress = useCallback(
    (chip: string) => {
      setQuery(chip);
    },
    [setQuery]
  );

  // ─── Tela de status de conexão ───
  if (isCheckingConnection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Title>Estudo Bíblico</Title>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Paragraph style={styles.statusText}>
            Conectando ao Ollama...
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  if (!ollamaConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Title>Estudo Bíblico</Title>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={styles.statusIcon}>
            <Feather name="wifi-off" size={48} color={colors.secondaryText} />
          </View>
          <Title centered style={styles.statusTitle}>
            Ollama Não Encontrado
          </Title>
          <Paragraph centered style={styles.statusDescription}>
            Para usar o estudo bíblico com IA, você precisa ter o Ollama rodando no seu computador.
          </Paragraph>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionStep}>
              <Text style={styles.instructionBold}>1.</Text> Instale o Ollama em{' '}
              <Text style={styles.instructionHighlight}>ollama.com</Text>
            </Text>
            <Text style={styles.instructionStep}>
              <Text style={styles.instructionBold}>2.</Text> Execute no terminal:{'\n'}
              <Text style={styles.codeText}>ollama pull bigwest60/bible-scholar</Text>
            </Text>
            <Text style={styles.instructionStep}>
              <Text style={styles.instructionBold}>3.</Text> Certifique-se de que o Ollama está rodando
            </Text>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              setIsCheckingConnection(true);
              const connected = await checkOllamaConnection();
              let model = false;
              if (connected) model = await checkModelAvailable();
              setConnectionStatus(connected, model);
              setIsCheckingConnection(false);
            }}
          >
            <Feather name="refresh-cw" size={18} color={colors.accent} />
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!modelAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Title>Estudo Bíblico</Title>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.centerContent}>
          <View style={styles.statusIcon}>
            <Feather name="download" size={48} color={colors.accent} />
          </View>
          <Title centered style={styles.statusTitle}>
            Modelo Não Encontrado
          </Title>
          <Paragraph centered style={styles.statusDescription}>
            O Ollama está rodando, mas o modelo Bible Scholar não foi encontrado.
          </Paragraph>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionStep}>
              Execute no terminal:
            </Text>
            <Text style={[styles.codeText, { marginTop: spacing.sm }]}>
              ollama pull bigwest60/bible-scholar
            </Text>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              setIsCheckingConnection(true);
              const connected = await checkOllamaConnection();
              let model = false;
              if (connected) model = await checkModelAvailable();
              setConnectionStatus(connected, model);
              setIsCheckingConnection(false);
            }}
          >
            <Feather name="refresh-cw" size={18} color={colors.accent} />
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Tela principal ───
  const hasResponse = currentResponse.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Title>Estudo Bíblico</Title>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Indicador de conexão */}
          <View style={styles.connectionBadge}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>
              {getActiveProviderName()}
            </Text>
          </View>

          {!hasResponse && !isGenerating && (
            <>
              {/* Introdução */}
              <View style={styles.introSection}>
                <View style={styles.introIconContainer}>
                  <Feather name="book-open" size={40} color={colors.accent} />
                </View>
                <Title centered style={styles.introTitle}>
                  Estudo Bíblico com IA
                </Title>
                <Paragraph centered style={styles.introDescription}>
                  Digite um tema, passagem ou pergunta. O Bible Scholar buscará na nossa
                  Bíblia Católica e gerará um estudo estruturado para você.
                </Paragraph>
              </View>

              {/* Sugestões */}
              <Text style={styles.suggestionsLabel}>Sugestões de temas:</Text>
              <View style={styles.chipsContainer}>
                {SUGGESTION_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.chip}
                    onPress={() => handleChipPress(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Loading / Resposta gerada */}
          {isGenerating && !currentResponse && (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingTitle}>Gerando estudo bíblico...</Text>
              <Text style={styles.loadingHint}>
                Buscando versículos na Bíblia Católica e{' '}
                processando com {getActiveProviderName()}.
              </Text>
            </View>
          )}

          {(hasResponse || (isGenerating && currentResponse)) && (
            <View style={styles.responseSection}>
              <View style={styles.queryBadge}>
                <Feather name="search" size={14} color={colors.accent} />
                <Text style={styles.queryBadgeText}>{currentQuery}</Text>
              </View>

              <Text style={styles.responseText}>
                {currentResponse}
                {isGenerating && <Text style={styles.cursor}>▊</Text>}
              </Text>

              {!isGenerating && hasResponse && (
                <TouchableOpacity
                  style={styles.newStudyButton}
                  onPress={handleNewStudy}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={18} color={colors.accent} />
                  <Text style={styles.newStudyText}>Novo Estudo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Erro */}
          {error && (
            <View style={styles.errorCard}>
              <Feather name="alert-circle" size={20} color="#E57373" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input fixo no rodapé */}
        {!hasResponse && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={currentQuery}
              onChangeText={setQuery}
              placeholder="Ex: A parábola do semeador..."
              placeholderTextColor={colors.placeholder}
              editable={!isGenerating}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              multiline={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!currentQuery.trim() || isGenerating) && styles.sendButtonDisabled,
              ]}
              onPress={isGenerating ? handleCancel : handleSubmit}
              disabled={!currentQuery.trim() && !isGenerating}
              activeOpacity={0.7}
            >
              <Feather
                name={isGenerating ? 'square' : 'send'}
                size={20}
                color={
                  !currentQuery.trim() && !isGenerating
                    ? colors.placeholder
                    : '#000'
                }
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Botão de cancelar durante geração */}
        {isGenerating && (
          <View style={styles.inputBar}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Feather name="square" size={16} color={colors.primaryText} />
              <Text style={styles.cancelText}>Parar Geração</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, spacing: any, typography: any, radius: any, shadow: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    scrollArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },

    // ─── Connection Badge ───
    connectionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.xl,
      marginBottom: spacing.lg,
    },
    connectionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
      marginRight: spacing.sm,
    },
    connectionText: {
      ...typography.small,
      fontSize: 12,
      color: colors.secondaryText,
    },

    // ─── Intro ───
    introSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    introIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    introTitle: {
      marginBottom: spacing.sm,
    },
    introDescription: {
      maxWidth: 320,
      lineHeight: 22,
    },

    // ─── Sugestões ───
    suggestionsLabel: {
      ...typography.small,
      color: colors.accent,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
      marginBottom: spacing.md,
      marginTop: spacing.md,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    chipText: {
      ...typography.small,
      color: colors.primaryText,
    },

    // ─── Response ───
    responseSection: {
      marginTop: spacing.sm,
    },
    loadingSection: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.md,
    },
    loadingTitle: {
      ...typography.subtitle,
      color: colors.primaryText,
      marginTop: spacing.md,
    },
    loadingHint: {
      ...typography.small,
      color: colors.secondaryText,
      textAlign: 'center',
      lineHeight: 20,
    },
    queryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accent + '15',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    queryBadgeText: {
      ...typography.small,
      color: colors.accent,
      fontWeight: '600',
      flex: 1,
    },
    responseText: {
      ...typography.body,
      color: colors.primaryText,
      lineHeight: 26,
    },
    cursor: {
      color: colors.accent,
    },
    newStudyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.xl,
      borderWidth: 1,
      borderColor: colors.accent + '40',
    },
    newStudyText: {
      ...typography.body,
      color: colors.accent,
      fontWeight: '600',
    },

    // ─── Error ───
    errorCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: '#E5737310',
      padding: spacing.lg,
      borderRadius: radius.md,
      marginTop: spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: '#E57373',
    },
    errorText: {
      ...typography.small,
      color: '#E57373',
      flex: 1,
      lineHeight: 20,
    },

    // ─── Input Bar ───
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: spacing.sm,
    },
    textInput: {
      flex: 1,
      ...typography.body,
      color: colors.primaryText,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.xl,
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.inputBackground,
    },
    cancelButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.inputBackground,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    cancelText: {
      ...typography.body,
      color: colors.primaryText,
      fontWeight: '600',
    },

    // ─── Status Screens ───
    statusIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    statusTitle: {
      marginBottom: spacing.sm,
    },
    statusDescription: {
      marginBottom: spacing.xl,
      lineHeight: 22,
      maxWidth: 300,
    },
    statusText: {
      marginTop: spacing.md,
      color: colors.secondaryText,
    },
    instructionsCard: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: radius.lg,
      width: '100%',
      marginBottom: spacing.lg,
    },
    instructionStep: {
      ...typography.body,
      color: colors.primaryText,
      marginBottom: spacing.md,
      lineHeight: 24,
    },
    instructionBold: {
      fontWeight: '700',
      color: colors.accent,
    },
    instructionHighlight: {
      color: colors.accent,
      fontWeight: '600',
    },
    codeText: {
      ...typography.small,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: colors.accent,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      overflow: 'hidden',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    retryText: {
      ...typography.body,
      color: colors.accent,
      fontWeight: '600',
    },
  });
