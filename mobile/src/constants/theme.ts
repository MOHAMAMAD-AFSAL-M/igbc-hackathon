// KSEB VPP Prosumer App Theme

export const Colors = {
  background: '#0B0F19',
  surface: '#121826',
  surfaceLight: '#1E293B',
  surfaceBorder: '#2A364F',
  
  primary: '#10B981',        // Emerald Green for Clean Energy
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryGlow: 'rgba(16, 185, 129, 0.15)',

  secondary: '#06B6D4',      // Electric Cyan
  secondaryGlow: 'rgba(6, 182, 212, 0.15)',

  solar: '#F59E0B',          // Solar Amber
  solarGlow: 'rgba(245, 158, 11, 0.15)',

  ksebBlue: '#2563EB',       // KSEB official blue highlight
  ksebBlueLight: '#60A5FA',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Grid Status
  statusNormal: '#10B981',
  statusWarning: '#F59E0B',
  statusHighStress: '#F97316',
  statusCritical: '#EF4444',

  // Actions
  success: '#10B981',
  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.15)',
  warning: '#F59E0B',
  info: '#3B82F6',

  divider: '#1E293B',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  metricLarge: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  metricMedium: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
};
