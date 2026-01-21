import { useState, useEffect } from 'react'
import { format, isToday, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { storage, MoodEntry } from '../utils/storage'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/themeUtils'

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '😍', label: 'Excited' },
]

const MOOD_VALUES: Record<string, number> = {
  '😊': 7,
  '😌': 6,
  '😍': 8,
  '🤔': 5,
  '😴': 4,
  '😢': 2,
  '😰': 3,
  '😡': 1,
}

export default function MoodTracker() {
  const { theme, colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [note, setNote] = useState('')
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [streak, setStreak] = useState(0)
  const [weeklyData, setWeeklyData] = useState<{ date: string; mood: string | null }[]>([])
  const [allMoods, setAllMoods] = useState<MoodEntry[]>([])

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  useEffect(() => {
    loadMoods()
  }, [])

  const loadMoods = async () => {
    try {
      const entry = await storage.getMoodByDate(todayStr)
      setTodayEntry(entry)
      if (entry) {
        setSelectedMood(entry.mood)
        setNote(entry.note || '')
      }
      
      // Load all moods for calendar view
      const moods = await storage.getAllMoods()
      setAllMoods(moods)
      
      const streak = await storage.getStreak()
      setStreak(streak)
      
      const weekly = await storage.getWeeklyData()
      setWeeklyData(weekly)
    } catch (error) {
      console.error('Error loading moods:', error)
    }
  }

  const handleSaveMood = async () => {
    if (!selectedMood) return

    const entry: MoodEntry = {
      date: todayStr,
      mood: selectedMood,
      note: note.trim() || undefined,
    }

    try {
      await storage.saveMood(entry)
      await loadMoods()
    } catch (error) {
      console.error('Error saving mood:', error)
    }
  }

  const handleUpdateMood = async () => {
    if (!selectedMood) return

    const entry: MoodEntry = {
      date: todayStr,
      mood: selectedMood,
      note: note.trim() || undefined,
    }

    try {
      await storage.saveMood(entry)
      await loadMoods()
    } catch (error) {
      console.error('Error updating mood:', error)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getMoodForDate = (date: Date): MoodEntry | null => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return allMoods.find((m) => m.date === dateStr) || null
  }

  const chartData = weeklyData.map((item) => ({
    date: format(parseISO(item.date), 'EEE'),
    value: item.mood ? MOOD_VALUES[item.mood] || 0 : null,
  }))

  return (
    <div className="space-y-6">
      {/* Privacy Message */}
      <div className={`${themeClasses.card} rounded-xl shadow-md p-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className={`font-semibold ${themeClasses.text} mb-1`}>
              Your data never leaves your device
            </p>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              MindSpace does not collect, store, or transmit any personal data. All information stays on your device.
            </p>
          </div>
        </div>
      </div>

      <div className={`${themeClasses.card} rounded-xl shadow-md p-6 border ${themeClasses.border}`}>
        <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>How are you feeling today?</h2>
        
        {todayEntry && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">✓ You've already logged your mood today!</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 mb-4">
          {MOODS.map((mood) => (
            <button
              key={mood.emoji}
              onClick={() => setSelectedMood(mood.emoji)}
              className={`p-4 rounded-xl text-4xl transition-all ${
                selectedMood === mood.emoji
                  ? `${themeClasses.primaryBgLight} scale-110 ring-2 ${themeClasses.primaryRing}`
                  : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              {mood.emoji}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
            Optional Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How are you feeling? (optional)"
            className={`w-full px-4 py-2 ${themeClasses.card} border ${themeClasses.border} rounded-lg ${themeClasses.primaryFocus} focus:border-transparent ${themeClasses.text}`}
            rows={3}
          />
        </div>

        {todayEntry ? (
          <button
            onClick={handleUpdateMood}
            className={`w-full ${themeClasses.primaryBg} text-white py-3 rounded-lg font-semibold ${themeClasses.primaryBgHover} transition-colors`}
          >
            Update Today's Mood
          </button>
        ) : (
          <button
            onClick={handleSaveMood}
            disabled={!selectedMood}
            className={`w-full ${themeClasses.primaryBg} text-white py-3 rounded-lg font-semibold ${themeClasses.primaryBgHover} transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
          >
            Save Mood
          </button>
        )}
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Current Streak</p>
            <p className="text-4xl font-bold">{streak} 🔥</p>
          </div>
          <div className="text-6xl">🔥</div>
        </div>
      </div>

      {/* Weekly Chart */}
      {chartData.some((d) => d.value !== null) && (
        <div className={`${themeClasses.card} rounded-xl shadow-md p-6 border ${themeClasses.border}`}>
          <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>Weekly Mood Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#475569' : '#e2e8f0'} 
              />
              <XAxis 
                dataKey="date" 
                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                stroke={theme === 'dark' ? '#475569' : '#e2e8f0'}
              />
              <YAxis 
                domain={[0, 10]} 
                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#4b5563' }}
                stroke={theme === 'dark' ? '#475569' : '#e2e8f0'}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#f1f5f9' : '#1f2937',
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Calendar View */}
      <div className={`${themeClasses.card} rounded-xl shadow-md p-6 border ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg ${themeClasses.text}`}
          >
            ←
          </button>
          <h3 className={`text-xl font-bold ${themeClasses.text}`}>
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg ${themeClasses.text}`}
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className={`text-center text-sm font-medium ${themeClasses.textSecondary} py-2`}>
              {day}
            </div>
          ))}
          
          {daysInMonth.map((day) => {
            const entry = getMoodForDate(day)
            const isCurrentDay = isToday(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square flex items-center justify-center rounded-lg text-2xl ${
                  isCurrentDay
                    ? `${themeClasses.primaryBgLight} ring-2 ${themeClasses.primaryRing}`
                    : entry
                    ? 'bg-gray-50 dark:bg-slate-700'
                    : isCurrentMonth
                    ? `${themeClasses.card}`
                    : 'bg-gray-50 dark:bg-slate-800 opacity-50'
                }`}
              >
                {entry ? entry.mood : <span className={`${themeClasses.textSecondary} text-sm`}>{format(day, 'd')}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
