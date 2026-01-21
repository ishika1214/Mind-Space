import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/themeUtils'
import { journalStorage, JournalEntry } from '../utils/storage'

const AUTO_SAVE_DELAY = 2000 // 2 seconds

export default function Journal() {
  const { colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDraft, setIsDraft] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const autoSaveTimerRef = useRef<number | null>(null)
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  useEffect(() => {
    loadJournal()
  }, [])

  useEffect(() => {
    // Auto-save draft when content changes
    if (content.trim()) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set new timer
      autoSaveTimerRef.current = window.setTimeout(() => {
        autoSaveDraft()
      }, AUTO_SAVE_DELAY)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [content])

  const loadJournal = async () => {
    try {
      const entry = await journalStorage.getJournalByDate(todayStr)
      if (entry) {
        setContent(entry.content)
        setIsDraft(entry.draft || false)
        setLastSaved(new Date(entry.lastModified))
      }
    } catch (error) {
      console.error('Error loading journal:', error)
    }
  }

  const autoSaveDraft = async () => {
    if (!content.trim()) return

    try {
      setIsSaving(true)
      const entry: JournalEntry = {
        date: todayStr,
        content: content.trim(),
        draft: true,
        lastModified: Date.now(),
        createdAt: lastSaved ? new Date(lastSaved).getTime() : Date.now(),
      }

      await journalStorage.saveJournal(entry)
      setIsDraft(true)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error auto-saving draft:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return

    try {
      setIsSaving(true)
      const entry: JournalEntry = {
        date: todayStr,
        content: content.trim(),
        draft: false,
        lastModified: Date.now(),
        createdAt: lastSaved ? new Date(lastSaved).getTime() : Date.now(),
      }

      await journalStorage.saveJournal(entry)
      setIsDraft(false)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving journal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await journalStorage.deleteJournal(todayStr)
      setContent('')
      setIsDraft(false)
      setLastSaved(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting journal:', error)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  return (
    <div className="space-y-6">
      {/* Privacy Message */}
      <div className={`${themeClasses.card} rounded-xl shadow-md p-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className={`font-semibold ${themeClasses.text} mb-1`}>
              Your journal never leaves your device
            </p>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              MindSpace does not collect, store, or transmit any personal data. All information stays on your device.
            </p>
          </div>
        </div>
      </div>

      {/* Journal Editor */}
      <div className={`${themeClasses.card} rounded-xl shadow-md p-6 border ${themeClasses.border}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Today's Journal</h2>
            <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {lastSaved && (
            <div className={`text-xs ${themeClasses.textSecondary}`}>
              {isDraft ? 'Draft saved' : 'Saved'} {format(lastSaved, 'h:mm a')}
            </div>
          )}
        </div>

        {/* Rich Text Editor (Textarea with markdown support) */}
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Write your thoughts, feelings, or reflections for today..."
          className={`w-full min-h-[400px] px-4 py-3 ${themeClasses.card} border ${themeClasses.border} rounded-lg ${themeClasses.text} placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 ${themeClasses.primaryFocus} resize-none`}
          style={{
            fontFamily: 'inherit',
            lineHeight: '1.6',
          }}
        />

        {/* Markdown Tips */}
        <div className={`mt-3 p-3 ${themeClasses.primaryBgLight} rounded-lg border ${themeClasses.primaryBorder}`}>
          <p className={`text-xs ${themeClasses.textSecondary} mb-1 font-semibold`}>
            Formatting Tips:
          </p>
          <ul className={`text-xs ${themeClasses.textSecondary} space-y-0.5 list-disc list-inside`}>
            <li>Use **bold** for emphasis</li>
            <li>Use *italic* for subtle emphasis</li>
            <li>Press Enter twice for new paragraphs</li>
            <li>Auto-saves as draft every 2 seconds</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className={`flex-1 ${themeClasses.primaryBg} text-white py-3 rounded-lg font-semibold ${themeClasses.primaryBgHover} transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>{isDraft ? 'Save Entry' : 'Update Entry'}</span>
              </>
            )}
          </button>

          {content.trim() && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              🗑️ Delete
            </button>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <p className={`text-sm ${themeClasses.text} mb-3`}>
              Are you sure you want to delete today's journal entry? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 ${themeClasses.card} border ${themeClasses.border} ${themeClasses.text} py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Previous Entries Preview */}
      <MyJournals themeClasses={themeClasses} />
    </div>
  )
}

function MyJournals({ themeClasses }: { themeClasses: ReturnType<typeof getThemeClasses> }) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [showAll])

  const loadEntries = async () => {
    try {
      const allEntries = await journalStorage.getAllJournals()
      // Sort by date descending, exclude today
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const filtered = allEntries
        .filter((e) => e.date !== todayStr && !e.draft)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, showAll ? 10 : 3)

      setEntries(filtered)
    } catch (error) {
      console.error('Error loading entries:', error)
    }
  }

  if (entries.length === 0) return null

  return (
    <div className={`${themeClasses.card} rounded-xl shadow-md p-6 border ${themeClasses.border}`}>
      <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>My Journals</h3>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.date}
            className={`p-3 border ${themeClasses.border} rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-semibold ${themeClasses.text}`}>
                {format(new Date(entry.date), 'MMMM d, yyyy')}
              </span>
              <span className={`text-xs ${themeClasses.textSecondary}`}>
                {format(new Date(entry.lastModified), 'h:mm a')}
              </span>
            </div>
            <p className={`text-sm ${themeClasses.textSecondary} line-clamp-2`}>
              {entry.content.substring(0, 150)}
              {entry.content.length > 150 && '...'}
            </p>
          </div>
        ))}
      </div>
      {entries.length >= 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`mt-4 w-full ${themeClasses.primaryBgLight} ${themeClasses.primary} py-2 rounded-lg font-medium ${themeClasses.primaryBgLightHover} transition-colors`}
        >
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  )
}
