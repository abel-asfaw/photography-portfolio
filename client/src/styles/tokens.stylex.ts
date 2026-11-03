import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  textLight: '#e5e5e5',
  textMuted: '#737373',
  textDim: '#9ca3af',
  textSubtle: '#a1a1a6',
  textCaption: '#8a8a8f',
  surface: '#27272a',
  light: '#f9fafb',
  lightHover: '#d1d5db',
  accent: '#0ea5e9',
  accentHover: '#0284c7',
  success: '#16a34a',
  successHover: '#15803d',
  danger: '#b91c1c',
  dangerHover: '#991b1b',
  error: '#ef4444',
  white: '#ffffff',
});

export const radii = stylex.defineVars({
  md: '0.375rem',
});

export const breakpoints = stylex.defineConsts({
  sm: '@media (min-width: 40rem)',
  lg: '@media (min-width: 64rem)',
});
