/**
 * Liquid Glass Theme Tokens
 *
 * This file defines the complete design system for the Liquid Glass UI theme.
 * Theme features translucent frosted surfaces, soft gradients, glossy borders,
 * and calm shadows for a premium, modern aesthetic.
 */

import { TextStyle, ViewStyle } from 'react-native';

export const theme = {
  // Color Palette
  palette: {
    // Primary gradient for buttons and accents
    primaryGradient: ['#4A90E2', '#5DADE2'] as const,

    // Accent gradient for gloss overlays
    accentGradient: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.07)'] as const,

    // Surface tints and backgrounds
    surfaceTint: 'rgba(255,255,255,0.06)',
    glassBg: 'rgba(255,255,255,0.12)',
    glassBorder: 'rgba(255,255,255,0.18)',

    // Background gradients
    backgroundGradient: ['#0B1220', '#1A1F2E'] as const,

    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.4)',

    // Status colors
    success: '#2ECC71',
    danger: '#FF5A5F',
    warning: '#F39C12',
    info: '#3498DB',

    // Input colors
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputBorderFocus: 'rgba(74,144,226,0.5)',

    // Disabled states
    disabled: 'rgba(255,255,255,0.3)',
  },

  // Border Radii
  radii: {
    card: 16,
    input: 12,
    button: 12,
    small: 8,
    large: 20,
  },

  // Spacing Scale (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Typography
  typography: {
    headline: {
      fontSize: 24,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 32,
      color: '#FFFFFF',
    },
    title: {
      fontSize: 20,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 28,
      color: '#FFFFFF',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 24,
      color: '#FFFFFF',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 20,
      color: 'rgba(255,255,255,0.6)',
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as TextStyle['fontWeight'],
      lineHeight: 24,
      color: '#FFFFFF',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as TextStyle['fontWeight'],
      lineHeight: 16,
      color: 'rgba(255,255,255,0.6)',
    },
  },

  // Shadows and Elevation
  shadows: {
    microShadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    } as ViewStyle,
    cardShadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 5,
    } as ViewStyle,
    buttonShadow: {
      shadowColor: '#4A90E2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,
  },

  // Blur Settings
  blur: {
    blurAmount: 18,
    blurType: 'light' as const,
  },

  // Animation Durations (milliseconds)
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

export type Theme = typeof theme;

/**
 * Hook to access theme in components
 */
export const useTheme = () => theme;
