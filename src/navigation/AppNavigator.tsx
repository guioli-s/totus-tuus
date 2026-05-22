import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home';
import { OracoesScreen } from '../screens/Oracoes';
import { ConfessionScreen } from '../screens/Confession';
import { SettingsScreen } from '../screens/Settings';
import { BibleScreen } from '../screens/Bible';
import { EstudosScreen } from '../screens/Studies';
import { BookChaptersScreen } from '../screens/Book/ChapterList';
import { BookReaderScreen } from '../screens/Book/Reader';
import { ReflexaoNavigator, ReflexaoStackParamList } from './ReflexaoNavigator';
import { useAppTheme } from '../theme';

export type RootStackParamList = {
  Home: undefined;
  Oracoes: { expandPrayerId?: string };
  Reflexao: NavigatorScreenParams<ReflexaoStackParamList> | undefined;
  Confissao: undefined;
  Settings: undefined;
  Biblia: undefined;
  Estudos: undefined;
  Tratado: undefined;
  BookChapters: { bookId: 'catecismo' | 'compendium' | 'tratado' };
  BookReader: { bookId: 'catecismo' | 'compendium' | 'tratado', index: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Oracoes" component={OracoesScreen} />
        <Stack.Screen name="Reflexao" component={ReflexaoNavigator} />
        <Stack.Screen name="Confissao" component={ConfessionScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Biblia" component={BibleScreen} />
        <Stack.Screen name="Estudos" component={EstudosScreen} />
        <Stack.Screen name="BookChapters" component={BookChaptersScreen} />
        <Stack.Screen name="BookReader" component={BookReaderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
