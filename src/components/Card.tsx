import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-surface rounded-2xl p-6 ${className}`}>
      {children}
    </View>
  );
}
