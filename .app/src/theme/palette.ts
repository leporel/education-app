// Single source of truth for app colors. Both App.vue (CSS vars) and
// stores/theme.ts (Naive UI overrides) read from here so the chrome,
// cards, inputs, badges, and charts always agree.

export interface Palette {
  // Surfaces
  bg: string          // page / app background
  surface: string     // sidebar, card, modal, popover
  surfaceAlt: string  // tree / nested panel
  border: string
  divider: string
  hover: string

  // Text
  text: string
  text2: string
  text3: string
  textMuted: string

  // Brand / accent
  primary: string
  primaryHover: string
  primaryPressed: string
  primarySoft: string  // tinted bg behind primary text (badges)

  // Semantic
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  info: string
  infoSoft: string
  error: string

  // Misc
  scrollThumb: string
}

export const dark: Palette = {
  bg: '#1a1b24',
  surface: '#1e1f2b',
  surfaceAlt: '#22232f',
  border: '#2d2e3c',
  divider: '#262731',
  hover: 'rgba(255,255,255,0.05)',

  text: '#d6d4ce',
  text2: '#c9c6bf',
  text3: '#9a978f',
  textMuted: '#6b6b78',

  primary: '#86a3cc',
  primaryHover: '#9fb8db',
  primaryPressed: '#6e8db6',
  primarySoft: 'rgba(134,163,204,0.18)',

  success: '#7fb98a',
  successSoft: 'rgba(127,185,138,0.18)',
  warning: '#d8b462',
  warningSoft: 'rgba(216,180,98,0.18)',
  info: '#86a3cc',
  infoSoft: 'rgba(134,163,204,0.18)',
  error: '#d48787',

  scrollThumb: 'rgba(214,212,206,0.22)',
}

export const light: Palette = {
  bg: '#f7f5f1',
  surface: '#efece7',
  surfaceAlt: '#f4f2ee',
  border: '#e6e2da',
  divider: '#ece8df',
  hover: 'rgba(0,0,0,0.04)',

  text: '#2a2a2e',
  text2: '#3d3d44',
  text3: '#6b6b72',
  textMuted: '#8e8b84',

  primary: '#3d6e9c',
  primaryHover: '#4d80b0',
  primaryPressed: '#2c5582',
  primarySoft: 'rgba(61,110,156,0.14)',

  success: '#5a8a4d',
  successSoft: 'rgba(90,138,77,0.14)',
  warning: '#b8873a',
  warningSoft: 'rgba(184,135,58,0.14)',
  info: '#3d6e9c',
  infoSoft: 'rgba(61,110,156,0.14)',
  error: '#b85c5c',

  scrollThumb: 'rgba(42,42,46,0.22)',
}

export type ThemeMode = 'light' | 'dark'

export function paletteFor(mode: ThemeMode): Palette {
  return mode === 'dark' ? dark : light
}
