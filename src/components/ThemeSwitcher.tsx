import { useState } from 'react'
import { useTheme, Theme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/themeUtils'

const THEME_OPTIONS: { value: Theme; label: string; emoji: string }[] = [
  { value: 'light', label: 'Light', emoji: '☀️' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'purple', label: 'Purple', emoji: '💜' },
  { value: 'blue', label: 'Blue', emoji: '💙' },
  { value: 'green', label: 'Green', emoji: '💚' },
  { value: 'sunset', label: 'Sunset', emoji: '🌅' },
  { value: 'ocean', label: 'Ocean', emoji: '🌊' },
]

const getPrimaryButtonClasses = (primary: string) => {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
    slate: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    purple: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    emerald: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700',
    orange: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
    cyan: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700',
  }
  return map[primary] || map.indigo
}

const getPrimaryBgClasses = (primary: string) => {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700',
    slate: 'bg-slate-100 text-slate-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
    cyan: 'bg-cyan-100 text-cyan-700',
  }
  return map[primary] || map.indigo
}

export default function ThemeSwitcher() {
  const { theme, setTheme, colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${getPrimaryButtonClasses(colors.primary)}`}
        aria-label="Change theme"
      >
        <span className="text-xl">
          {THEME_OPTIONS.find((t) => t.value === theme)?.emoji || '🎨'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 mt-2 w-48 ${themeClasses.card} rounded-xl shadow-lg border ${themeClasses.border} z-50 overflow-hidden`}>
            <div className="p-2">
              <p className={`px-3 py-2 text-xs font-semibold ${themeClasses.textSecondary} uppercase`}>
                Choose Theme
              </p>
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    theme === option.value
                      ? getPrimaryBgClasses(colors.primary)
                      : `${themeClasses.text} hover:bg-gray-100 dark:hover:bg-slate-700`
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                  {theme === option.value && (
                    <span className="ml-auto text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
