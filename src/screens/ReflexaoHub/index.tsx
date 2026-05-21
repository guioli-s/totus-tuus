import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Title } from '../../components/Title';
import { Paragraph } from '../../components/Paragraph';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BackButton } from '../../components/BackButton';
import { useExamenStore } from '../../store/useExamenStore';
import { saveSession } from '../../database/db';
import { ReflexaoStackParamList } from '../../navigation/ReflexaoNavigator';
import { useAppTheme } from '../../theme';

type Nav = NativeStackNavigationProp<ReflexaoStackParamList, 'ReflexaoHub'>;

export function ReflexaoHubScreen() {
  const navigation = useNavigation<Nav>();
  const session = useExamenStore((s) => s.session);
  const startSessionStore = useExamenStore((s) => s.startSession);

  const { colors, spacing } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, spacing), [colors, spacing]);

  // Se há sessão ativa, redireciona automaticamente
  useEffect(() => {
    if (session) {
      navigation.replace('Commandment', {
        commandmentId: session.currentCommandmentId,
      });
    }
  }, [session, navigation]);

  const handleStart = async () => {
    startSessionStore();
    try { await saveSession(1); } catch (e) { console.error(e); }
    navigation.navigate('Intro');
  };

  // Mostra loading/blank enquanto redireciona
  if (session) return <View style={styles.blank} />;

  return (
    <ScreenContainer>
      <BackButton />
      <View style={styles.center}>
        <Title centered style={styles.title}>Exame de Consciência</Title>
        <Paragraph centered>
          Inicie um novo exame de consciência.
        </Paragraph>
      </View>
      <View style={styles.bottom}>
        <PrimaryButton title="Iniciar exame de consciência" onPress={handleStart} />
      </View>
    </ScreenContainer>
  );
}

const getStyles = (colors: any, spacing: any) => StyleSheet.create({
  blank: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: { letterSpacing: 4 },
  bottom: { paddingBottom: spacing.md },
});
