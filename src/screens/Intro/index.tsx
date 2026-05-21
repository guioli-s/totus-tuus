import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Paragraph } from '../../components/Paragraph';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReflexaoStackParamList } from '../../navigation/ReflexaoNavigator';
import { useAppTheme } from '../../theme';

type Props = NativeStackScreenProps<ReflexaoStackParamList, 'Intro'>;

export function IntroScreen({ navigation }: Props) {
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const [buttonReady, setButtonReady] = useState(false);

  const { animation, spacing, typography } = useAppTheme();
  const styles = useMemo(() => getStyles(spacing, typography), [spacing, typography]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonReady(true);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: animation.duration * 2,
        useNativeDriver: true,
      }).start();
    }, 1000);
    return () => clearTimeout(timer);
  }, [buttonOpacity, animation.duration]);

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Paragraph centered style={styles.quote}>
          "Este é um momento de silêncio e verdade."
        </Paragraph>
        <View style={styles.gap} />
        <Paragraph centered style={styles.body}>
          Sem pressa.{'\n'}Sem julgamento.
        </Paragraph>
        <View style={styles.gap} />
        <Paragraph centered style={styles.body}>
          Leia cada mandamento com atenção.{'\n'}
          Escreva o que vier ao coração.
        </Paragraph>
      </View>

      <Animated.View style={[styles.bottom, { opacity: buttonOpacity }]}>
        <PrimaryButton
          title="Começar"
          onPress={() => navigation.navigate('Commandment', { commandmentId: 1 })}
          disabled={!buttonReady}
        />
      </Animated.View>
    </ScreenContainer>
  );
}

const getStyles = (spacing: any, typography: any) => StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  quote: {
    fontSize: Math.round(19 * (typography.body.fontSize / 16)),
    lineHeight: Math.round(32 * (typography.body.lineHeight / 24)),
    letterSpacing: 0.3,
  },
  body: {
    fontSize: typography.body.fontSize,
    lineHeight: Math.round(30 * (typography.body.lineHeight / 24)),
  },
  gap: {
    height: spacing.xl,
  },
  bottom: {
    paddingBottom: spacing.md,
  },
});
