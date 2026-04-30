import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import { dark, light, type Palette, type ThemeMode } from '@/theme/palette'

// Build Naive UI overrides from the shared palette so cards, inputs,
// alerts, etc. share the same surface/border palette as the app chrome.

function buildOverrides(p: Palette): GlobalThemeOverrides {
  return {
    common: {
      bodyColor: p.bg,
      cardColor: p.surface,
      modalColor: p.surface,
      popoverColor: p.surface,
      baseColor: p.bg,
      textColorBase: p.text,
      textColor1: p.text,
      textColor2: p.text2,
      textColor3: p.text3,
      borderColor: p.border,
      dividerColor: p.divider,
      hoverColor: p.hover,
      primaryColor: p.primary,
      primaryColorHover: p.primaryHover,
      primaryColorPressed: p.primaryPressed,
      primaryColorSuppl: p.primaryHover,
      successColor: p.success,
      successColorHover: p.success,
      successColorPressed: p.success,
      successColorSuppl: p.success,
      warningColor: p.warning,
      warningColorHover: p.warning,
      warningColorPressed: p.warning,
      warningColorSuppl: p.warning,
      errorColor: p.error,
      errorColorHover: p.error,
      errorColorPressed: p.error,
      errorColorSuppl: p.error,
      infoColor: p.info,
      infoColorHover: p.info,
      infoColorPressed: p.info,
      infoColorSuppl: p.info,
    },
    Card: { borderRadius: '10px', borderColor: p.border, color: p.surface },
    Button: {
      borderRadius: '10px',
      // Secondary variant: soft tinted background + accent text — matches our badges.
      colorSecondary: p.primarySoft,
      colorSecondaryHover: p.primarySoft,
      colorSecondaryPressed: p.primarySoft,
      textColorSecondary: p.primary,
      textColorSecondaryHover: p.primaryHover,
      textColorSecondaryPressed: p.primaryPressed,
    },
    Input: { borderRadius: '8px', color: p.surface, colorFocus: p.surface, border: `1px solid ${p.border}` },
    Tabs: { tabTextColorActiveLine: p.primary, barColor: p.primary },
    Alert: { borderRadius: '8px' },
  }
}

const lightOverrides = buildOverrides(light)
const darkOverrides = buildOverrides(dark)

export type { ThemeMode }

export const useTheme = defineStore('theme', () => {
  const mode = useStorage<ThemeMode>('edu.theme', 'dark')
  const naive = computed(() => (mode.value === 'dark' ? darkTheme : null))
  const overrides = computed(() => (mode.value === 'dark' ? darkOverrides : lightOverrides))
  const palette = computed<Palette>(() => (mode.value === 'dark' ? dark : light))
  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }
  return { mode, naive, overrides, palette, toggle }
})
