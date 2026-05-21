import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <View className="w-full mb-6">
      <Text className="text-textMuted text-xs mb-2 text-right tracking-wider">
        {current} de {total}
      </Text>
      <View className="w-full h-1.5 bg-surfaceLight rounded-full overflow-hidden">
        <View
          className="h-full bg-accent rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
