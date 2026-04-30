// Single source of truth for app colors. Both App.vue (CSS vars) and
// stores/theme.ts (Naive UI overrides) read from here so the chrome,
// cards, inputs, badges, and charts always agree.

export interface Palette {
  // Surfaces
  bg: string          // page / app background (outer shell, gaps)
  panel: string       // sidebar, top-nav chrome
  surface: string     // note edit/preview area, card, modal, popover
  surfaceAlt: string  // tree / nested panel
  border: string      // structural borders (panel edges, sidebar separators)
  borderCard: string  // card / content surface borders
  tagBg: string       // default NTag background
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
  bg:             '#1a1e25',
  panel:          '#1b2026',
  surface:        '#21262d',
  surfaceAlt:     '#1b1f26',
  border:         '#252a32',
  borderCard:     '#414751',
  tagBg:          '#353533',
  divider:        '#1f2329',
  hover:          'rgba(255,255,255,0.05)',

  text:           '#dde2ea',
  text2:          '#abb1bb',
  text3:          '#7a818c',
  textMuted:      '#5a606b',

  primary:        '#2563b8',
  primaryHover:   '#3b79ce',
  primaryPressed: '#0f4da2',
  primarySoft:    'rgba(37,99,184,0.22)',

  success:        '#6dba8a',
  successSoft:    '#23392f',
  warning:        '#d8b462',
  warningSoft:    'rgba(216,180,98,0.18)',
  info:           '#5b9bd5',
  infoSoft:       '#1b2e4a',
  error:          '#d48787',

  scrollThumb:    'rgba(221,226,234,0.22)',
}

export const light: Palette = {
  bg:             '#ebe9e5',
  panel:          '#e3e0db',
  surface:        '#e3e0db',
  surfaceAlt:     '#e8e6e2',
  border:         '#dbd7cf',
  borderCard:     '#b0aba1',
  tagBg:          '#d8d5cf',
  divider:        '#e0dcd4',
  hover:          'rgba(0,0,0,0.04)',

  text:           '#000000',
  text2:          '#3d3d44',
  text3:          '#6b6b72',
  textMuted:      '#8e8b84',

  primary:        '#3d6e9c',
  primaryHover:   '#4d80b0',
  primaryPressed: '#2c5582',
  primarySoft:    'rgba(61,110,156,0.14)',

  success:        '#5a8a4d',
  successSoft:    'rgba(90,138,77,0.14)',
  warning:        '#b8873a',
  warningSoft:    'rgba(184,135,58,0.14)',
  info:           '#3d6e9c',
  infoSoft:       'rgba(61,110,156,0.14)',
  error:          '#b85c5c',

  scrollThumb:    'rgba(42,42,46,0.22)',
}

export type ThemeMode = 'light' | 'dark'

export function paletteFor(mode: ThemeMode): Palette {
  return mode === 'dark' ? dark : light
}
