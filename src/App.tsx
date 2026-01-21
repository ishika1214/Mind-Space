import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { getThemeClasses } from './utils/themeUtils'
import MoodTracker from './components/MoodTracker'
import BreathingExercise from './components/BreathingExercise'
import StressQuiz from './components/StressQuiz'
import Journal from './components/Journal'
import Intro from './components/Intro'
import ThemeSwitcher from './components/ThemeSwitcher'

function TopTabs() {
  const { colors } = useTheme()
  const themeClasses = getThemeClasses(colors)

  const navItems = [
    { path: '/', label: 'Mood', icon: '😊' },
    { path: '/breathing', label: 'Breathing', icon: '🌬️' },
    { path: '/quiz', label: 'Quiz', icon: '🧠' },
    { path: '/journal', label: 'Journal', icon: '📝' },
  ]

  return (
    <div className={`max-w-4xl mx-auto px-4 pb-3`}>
      <div className={`flex items-center gap-2 ${colors.card} rounded-xl border ${colors.border} p-1`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                isActive
                  ? `${themeClasses.primary} ${themeClasses.primaryBgLight}`
                  : `${themeClasses.textSecondary} hover:opacity-80`,
              ].join(' ')
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function AppContent() {
  const { colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const navigate = useNavigate()

  const userName = localStorage.getItem('mind-space-user-name')?.trim() || ''
  const hasOnboarded = userName.length > 0

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.background} transition-colors duration-300`}>
        <header className={`${colors.card} shadow-sm sticky top-0 z-40 border-b ${colors.border}`}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.primary}`}>🧘 Mind Space</h1>
              {hasOnboarded && (
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Welcome back, <span className={themeClasses.text}>{userName}</span>
                </p>
              )}
            </div>
            <ThemeSwitcher />
          </div>
          {hasOnboarded && <TopTabs />}
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6 pb-10">
          <Routes>
            <Route path="/intro" element={<Intro onDone={() => navigate('/')} />} />

            {/* Guard: if not onboarded, send everything to intro */}
            {!hasOnboarded ? (
              <Route path="*" element={<Navigate to="/intro" replace />} />
            ) : (
              <>
                <Route path="/" element={<MoodTracker />} />
                <Route path="/breathing" element={<BreathingExercise />} />
                <Route path="/quiz" element={<StressQuiz />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
