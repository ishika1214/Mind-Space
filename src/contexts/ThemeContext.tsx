import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'purple' | 'blue' | 'green' | 'sunset' | 'ocean'

export interface ThemeColors {
  name: string
  primary: string
  primaryLight: string
  primaryDark: string
  background: string
  backgroundGradient: string
  card: string
  text: string
  textSecondary: string
  border: string
  accent: string
}

const THEMES: Record<Theme, ThemeColors> = {
  light: {
    name: 'Light',
    primary: 'indigo',
    primaryLight: 'indigo-50',
    primaryDark: 'indigo-700',
    background: 'from-indigo-50 via-purple-50 to-pink-50',
    backgroundGradient: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
    card: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    accent: 'indigo',
  },
  dark: {
    name: 'Dark',
    primary: 'slate',
    primaryLight: 'slate-800',
    primaryDark: 'slate-900',
    background: 'from-slate-900 via-slate-800 to-slate-900',
    backgroundGradient: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    card: 'bg-slate-800',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    border: 'border-slate-700',
    accent: 'indigo',
  },
  purple: {
    name: 'Purple',
    primary: 'purple',
    primaryLight: 'purple-50',
    primaryDark: 'purple-700',
    background: 'from-purple-50 via-pink-50 to-purple-100',
    backgroundGradient: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100',
    card: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-purple-200',
    accent: 'purple',
  },
  blue: {
    name: 'Blue',
    primary: 'blue',
    primaryLight: 'blue-50',
    primaryDark: 'blue-700',
    background: 'from-blue-50 via-cyan-50 to-blue-100',
    backgroundGradient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    card: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-blue-200',
    accent: 'blue',
  },
  green: {
    name: 'Green',
    primary: 'emerald',
    primaryLight: 'emerald-50',
    primaryDark: 'emerald-700',
    background: 'from-emerald-50 via-teal-50 to-green-50',
    backgroundGradient: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50',
    card: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-emerald-200',
    accent: 'emerald',
  },
  sunset: {
    name: 'Sunset',
    primary: 'orange',
    primaryLight: 'orange-50',
    primaryDark: 'orange-700',
    background: 'from-orange-50 via-pink-50 to-red-50',
    backgroundGradient: 'bg-gradient-to-br from-orange-50 via-pink-50 to-red-50',
    card: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-orange-200',
    accent: 'orange',
  },
  ocean: {
    name: 'Ocean',
    primary: 'cyan',
    primaryLight: 'cyan-50',
    primaryDark: 'cyan-700',
    background: 'from-cyan-50 via-blue-50 to-teal-50',
    backgroundGradient: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50',
    card: 'bg-white',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-cyan-200',
    accent: 'cyan',
  },
}

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('mind-space-theme')
    const initialTheme = (saved as Theme) || 'light'
    
    // Initialize dark class on mount
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    return initialTheme
  })

  useEffect(() => {
    localStorage.setItem('mind-space-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    
    // Add/remove dark class for dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const colors = THEMES[theme]

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
