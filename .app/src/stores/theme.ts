import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'

// Soft, eye-friendly palette. Dark is warm-grey, not pitch black.

const lightOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: '#f7f5f1',
    cardColor: '#fffdf9',
    modalColor: '#fffdf9',
    popoverColor: '#fffdf9',
    baseColor: '#ffffff',
    textColorBase: '#2a2a2e',
    textColor1: '#2a2a2e',
    textColor2: '#3d3d44',
    textColor3: '#6b6b72',
    borderColor: '#e6e2da',
    dividerColor: '#ece8df',
    primaryColor: '#2a8892',
    primaryColorHover: '#3aa0ab',
    primaryColorPressed: '#1f727a',
    primaryColorSuppl: '#3aa0ab',
    successColor: '#6b8e5a',
    warningColor: '#c49a3a',
    errorColor: '#b85c5c',
    infoColor: '#5c8ea0',
  },
  Card: { borderRadius: '8px' },
  Button: { borderRadius: '6px' },
}

const darkOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: '#1e1e24',
    cardColor: '#26262d',
    modalColor: '#26262d',
    popoverColor: '#2b2b33',
    baseColor: '#1e1e24',
    textColorBase: '#d6d4ce',
    textColor1: '#e4e2dc',
    textColor2: '#c9c6bf',
    textColor3: '#8e8b84',
    borderColor: '#36363e',
    dividerColor: '#303038',
    primaryColor: '#6ecbd4',
    primaryColorHover: '#87d8e0',
    primaryColorPressed: '#5ab8c2',
    primaryColorSuppl: '#87d8e0',
    successColor: '#8fb07a',
    warningColor: '#d8b462',
    errorColor: '#d48787',
    infoColor: '#8fb8c8',
  },
  Card: { borderRadius: '8px' },
  Button: { borderRadius: '6px' },
}

export type ThemeMode = 'light' | 'dark'

export const useTheme = defineStore('theme', () => {
  const mode = useStorage<ThemeMode>('edu.theme', 'dark')
  const naive = computed(() => (mode.value === 'dark' ? darkTheme : null))
  const overrides = computed(() => (mode.value === 'dark' ? darkOverrides : lightOverrides))
  function toggle() {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }
  return { mode, naive, overrides, toggle }
})
