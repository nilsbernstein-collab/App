import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types/settings'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function resolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', resolvedTheme(theme))
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'nichetrack-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useThemeStore.getState()
    if (theme === 'system') applyTheme('system')
  })
}
