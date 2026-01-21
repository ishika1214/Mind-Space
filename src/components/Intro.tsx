import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/themeUtils'

export default function Intro({ onDone }: { onDone: () => void }) {
  const { colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const [name, setName] = useState('')

  const handleContinue = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem('mind-space-user-name', trimmed)
    onDone()
  }

  return (
    <div className="space-y-6">
      <div className={`${themeClasses.card} rounded-2xl shadow-lg p-8 border ${themeClasses.border}`}>
        <h2 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>Welcome to MindSpace</h2>
        <p className={`${themeClasses.textSecondary}`}>
          A calm place to track your mood, breathe, reflect, and check in with yourself.
        </p>

        {/* Privacy message on intro */}
        <div className="mt-6 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className={`font-semibold ${themeClasses.text} mb-1`}>Your data never leaves your device</p>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                MindSpace does not collect, store, or transmit any personal data. All information stays on your device.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className={`block text-sm font-semibold ${themeClasses.text} mb-2`}>
            What should we call you?
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={`w-full px-4 py-3 ${themeClasses.card} border ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 ${themeClasses.primaryFocus}`}
          />
          <button
            onClick={handleContinue}
            disabled={!name.trim()}
            className={`mt-4 w-full ${themeClasses.primaryBg} text-white py-3 rounded-lg font-semibold ${themeClasses.primaryBgHover} transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

