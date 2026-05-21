import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme';

export function BackButton() {
  const navigation = useNavigation();
  const { colors, spacing } = useAppTheme();

  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.goBack()}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Feather name="arrow-left" size={26} color={colors.primaryText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
