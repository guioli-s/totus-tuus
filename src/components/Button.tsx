import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`py-4 px-8 rounded-2xl items-center ${
        isPrimary ? 'bg-accent' : 'bg-surfaceLight'
      }`}
    >
      <Text
        className={`text-base font-semibold tracking-wide ${
          isPrimary ? 'text-background' : 'text-textSecondary'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
