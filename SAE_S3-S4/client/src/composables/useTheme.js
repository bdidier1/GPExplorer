import { ref } from 'vue'

const STORAGE_KEY = 'darkMode'
const darkMode = ref(false)
let initialized = false

function applyThemeClass(isDark) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark-mode', isDark)
}

function notifyThemeChange(isDark) {
  if (typeof globalThis === 'undefined') return
  globalThis.dispatchEvent(new CustomEvent('themeChanged', {
    detail: { darkMode: isDark }
  }))
}

function setDarkMode(value, options = {}) {
  const { persist = true, notify = true } = options
  const nextValue = Boolean(value)

  darkMode.value = nextValue
  applyThemeClass(nextValue)

  if (persist && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(nextValue))
  }

  if (notify) {
    notifyThemeChange(nextValue)
  }
}

function toggleDarkMode() {
  setDarkMode(!darkMode.value)
}

function initTheme() {
  if (initialized) {
    applyThemeClass(darkMode.value)
    return darkMode.value
  }

  let initial = false

  if (typeof localStorage !== 'undefined') {
    const savedDarkMode = localStorage.getItem(STORAGE_KEY)
    if (savedDarkMode === 'true' || savedDarkMode === 'false') {
      initial = savedDarkMode === 'true'
    } else if (typeof globalThis.matchMedia === 'function') {
      initial = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  setDarkMode(initial, { persist: false, notify: false })
  initialized = true

  return darkMode.value
}

export function useTheme() {
  return {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    initTheme
  }
}
