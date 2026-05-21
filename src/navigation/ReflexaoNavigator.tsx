import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReflexaoHubScreen } from '../screens/ReflexaoHub';
import { IntroScreen } from '../screens/Intro';
import { CommandmentScreen } from '../screens/Commandment';
import { ReflectionScreen } from '../screens/Reflection';
import { ReviewScreen } from '../screens/Review';
import { useAppTheme } from '../theme';

export type ReflexaoStackParamList = {
  ReflexaoHub: undefined;
  Intro: undefined;
  // returnToReview: true quando navegado da tela de Revisão para edição
  Commandment: { commandmentId: number; returnToReview?: boolean };
  Reflection: { commandmentId: number; returnToReview?: boolean };
  Review: undefined;
};

const Stack = createNativeStackNavigator<ReflexaoStackParamList>();

export function ReflexaoNavigator() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="ReflexaoHub"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="ReflexaoHub" component={ReflexaoHubScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Commandment" component={CommandmentScreen} />
      <Stack.Screen name="Reflection" component={ReflectionScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
