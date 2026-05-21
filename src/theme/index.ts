import { useSettingsStore } from '../store/useSettingsStore';

export const darkColors = {
  background: '#0D0D0D',
  surface: '#141414',
  primaryText: '#F5F5F5',
  secondaryText: '#A0A0A0',
  accent: '#C8A96A',
  divider: '#1F1F1F',
  inputBackground: '#1A1A1A',
  placeholder: '#6B6B6B',
};

export const lightColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  primaryText: '#121212',
  secondaryText: '#5E5E5E',
  accent: '#C8A96A', // Manter dourado
  divider: '#E0E0E0',
  inputBackground: '#F0F0F0',
  placeholder: '#9E9E9E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadow = {
  subtle: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
};

export const animation = {
  duration: 250,
};

const textScales = {
  small: 0.85,
  medium: 1,
  large: 1.2,
};

export function getTypography(scaleFactor: 'small' | 'medium' | 'large') {
  const scale = textScales[scaleFactor];
  return {
    title: {
      fontSize: Math.round(24 * scale),
      fontWeight: '600' as const,
      lineHeight: Math.round(32 * scale),
    },
    subtitle: {
      fontSize: Math.round(18 * scale),
      fontWeight: '500' as const,
      lineHeight: Math.round(26 * scale),
    },
    body: {
      fontSize: Math.round(16 * scale),
      fontWeight: '400' as const,
      lineHeight: Math.round(24 * scale),
    },
    small: {
      fontSize: Math.round(14 * scale),
      fontWeight: '400' as const,
      lineHeight: Math.round(20 * scale),
    },
  };
}

export function useAppTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const textScale = useSettingsStore((s) => s.textScale);

  const colors = theme === 'light' ? lightColors : darkColors;
  const typography = getTypography(textScale);

  return { colors, spacing, typography, radius, shadow, animation, isDark: theme === 'dark' };
}

// Default estático (apenas para fallback ou transição)
export const colors = darkColors;
export const typography = getTypography('medium');
