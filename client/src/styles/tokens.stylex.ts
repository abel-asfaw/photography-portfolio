import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  textLight: '#e5e5e5',
  textMuted: '#737373',
  textDim: '#9ca3af',
  textSubtle: '#a1a1a6',
  textCaption: '#8a8a8f',
  surface: '#27272a',
  accent: '#0ea5e9',
  error: '#ef4444',
  white: '#ffffff',
  // The admin editor's surfaces, darkest first, and its highlight color.
  sunken: '#101012',
  card: '#121214',
  panel: '#141416',
  raised: '#1c1c1f',
  control: '#2a2a2e',
  controlHover: '#36363b',
  border: '#2a2a2e',
  borderSubtle: '#1f1f22',
  borderPanel: '#232326',
  borderStrong: '#3a3a3f',
  highlight: '#38bdf8',
  highlightHover: '#7dd3fc',
  onHighlight: '#06121a',
  highlightSoft: 'rgb(56 189 248 / 0.08)',
  highlightMuted: 'rgb(56 189 248 / 0.14)',
  positive: '#4ade80',
  positiveSoft: '#10251a',
  dangerText: '#f87171',
  dangerFill: '#dc2626',
  dangerFillHover: '#b91c1c',
  dangerSoft: '#2a1414',
  dangerSoftText: '#fca5a5',
});

export const radii = stylex.defineVars({
  md: '0.375rem',
});

export const breakpoints = stylex.defineConsts({
  sm: '@media (min-width: 40rem)',
  lg: '@media (min-width: 64rem)',
  /** A mouse or trackpad, as opposed to touch. */
  finePointer: '@media (hover: hover) and (pointer: fine)',
});
