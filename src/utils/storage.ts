export interface MoodEntry {
  date: string // YYYY-MM-DD format (used as primary key)
  mood: string // emoji
  note?: string
}

export interface StressQuizEntry {
  date: string // YYYY-MM-DD format (used as primary key)
  score: number // Total score out of 50
  level: 'Low' | 'Moderate' | 'High' // Stress level
  answers: Record<number, number> // Question ID -> Answer value
  timestamp: number // When quiz was completed
}

export interface JournalEntry {
  date: string // YYYY-MM-DD format (used as primary key)
  content: string // Journal content (supports markdown/rich text)
  draft?: boolean // Whether this is a draft (auto-saved)
  lastModified: number // Timestamp of last modification
  createdAt: number // Timestamp of creation
}

// IndexedDB Database Configuration
const DB_NAME = 'MindSpaceDB'
const DB_VERSION = 2 // Incremented to add new stores
const MOODS_STORE = 'moods'
const STRESS_QUIZ_STORE = 'stressQuizzes'
const JOURNAL_STORE = 'journals'

// Module-level database connection (singleton pattern)
let db: IDBDatabase | null = null
let initPromise: Promise<void> | null = null

export const initIndexedDB = (): Promise<void> => {
  // Return existing promise if initialization is already in progress
  if (initPromise) return initPromise

  initPromise = new Promise((resolve, reject) => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'))
      return
    }

    // Open database (creates if doesn't exist)
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    // Handle errors
    request.onerror = () => {
      console.error('IndexedDB error:', request.error)
      reject(request.error)
    }

    // Handle success - database is ready
    request.onsuccess = () => {
      db = request.result
      console.log('IndexedDB initialized successfully')
      resolve()
    }

    // Handle upgrade - runs when version changes or database is created
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      const oldVersion = event.oldVersion || 0

      // Create moods object store if it doesn't exist
      if (!database.objectStoreNames.contains(MOODS_STORE)) {
        database.createObjectStore(MOODS_STORE, {
          keyPath: 'date',
        })
        console.log('Created object store:', MOODS_STORE)
      }

      // Create stress quizzes object store (version 2+)
      if (oldVersion < 2 && !database.objectStoreNames.contains(STRESS_QUIZ_STORE)) {
        database.createObjectStore(STRESS_QUIZ_STORE, {
          keyPath: 'date',
        })
        console.log('Created object store:', STRESS_QUIZ_STORE)
      }

      // Create journals object store (version 2+)
      if (oldVersion < 2 && !database.objectStoreNames.contains(JOURNAL_STORE)) {
        database.createObjectStore(JOURNAL_STORE, {
          keyPath: 'date',
        })
        console.log('Created object store:', JOURNAL_STORE)
      }
    }
  })

  return initPromise
}

export const storage = {
  /**
   * Get all mood entries from IndexedDB
   */
  async getAllMoods(): Promise<MoodEntry[]> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      // Create readonly transaction (faster, allows concurrent reads)
      const transaction = db!.transaction([MOODS_STORE], 'readonly')
      const store = transaction.objectStore(MOODS_STORE)

      // Get all entries
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Error getting all moods:', request.error)
        reject(request.error)
      }
    })
  },

  /**
   * Get mood entry for a specific date
   */
  async getMoodByDate(date: string): Promise<MoodEntry | null> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([MOODS_STORE], 'readonly')
      const store = transaction.objectStore(MOODS_STORE)

      // Get entry by primary key (date)
      const request = store.get(date)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        console.error('Error getting mood by date:', request.error)
        reject(request.error)
      }
    })
  },

  /**
   * Save or update a mood entry
   */
  async saveMood(entry: MoodEntry): Promise<void> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      // Create readwrite transaction (exclusive, ensures no conflicts)
      const transaction = db!.transaction([MOODS_STORE], 'readwrite')
      const store = transaction.objectStore(MOODS_STORE)

      // Put entry (inserts or updates based on key)
      const request = store.put(entry)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Error saving mood:', request.error)
        reject(request.error)
      }
    })
  },

  /**
   * Calculate mood streak (consecutive days with entries)
   */
  async getStreak(): Promise<number> {
    const moods = await this.getAllMoods()
    if (moods.length === 0) return 0

    // Sort by date descending (newest first)
    const sorted = moods.sort((a, b) => b.date.localeCompare(a.date))

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Count consecutive days from today backwards
    for (let i = 0; i < sorted.length; i++) {
      const entryDate = new Date(sorted[i].date)
      entryDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor(
        (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      // If this entry is exactly 'i' days ago, it's part of the streak
      if (daysDiff === i) {
        streak++
      } else {
        break // Streak broken
      }
    }

    return streak
  },

  /**
   * Get weekly mood data for chart (last 7 days)
   */
  async getWeeklyData(): Promise<{ date: string; mood: string | null }[]> {
    const today = new Date()
    const weekData: { date: string; mood: string | null }[] = []

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // Get mood for this date (uses fast primary key lookup)
      const entry = await this.getMoodByDate(dateStr)
      weekData.push({
        date: dateStr,
        mood: entry?.mood || null,
      })
    }

    return weekData
  },

  /**
   * Delete a mood entry by date
   */
  async deleteMood(date: string): Promise<void> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([MOODS_STORE], 'readwrite')
      const store = transaction.objectStore(MOODS_STORE)

      const request = store.delete(date)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Error deleting mood:', request.error)
        reject(request.error)
      }
    })
  },

  /**
   * Clear all mood entries (useful for testing or reset)
   */
  async clearAll(): Promise<void> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([MOODS_STORE], 'readwrite')
      const store = transaction.objectStore(MOODS_STORE)

      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Error clearing moods:', request.error)
        reject(request.error)
      }
    })
  },
}

/**
 * Stress Quiz Storage
 */
export const stressQuizStorage = {
  async saveQuizResult(entry: StressQuizEntry): Promise<void> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STRESS_QUIZ_STORE], 'readwrite')
      const store = transaction.objectStore(STRESS_QUIZ_STORE)

      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Error saving stress quiz:', request.error)
        reject(request.error)
      }
    })
  },

  async getQuizByDate(date: string): Promise<StressQuizEntry | null> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STRESS_QUIZ_STORE], 'readonly')
      const store = transaction.objectStore(STRESS_QUIZ_STORE)

      const request = store.get(date)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => {
        console.error('Error getting stress quiz:', request.error)
        reject(request.error)
      }
    })
  },

  async getAllQuizzes(): Promise<StressQuizEntry[]> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STRESS_QUIZ_STORE], 'readonly')
      const store = transaction.objectStore(STRESS_QUIZ_STORE)

      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => {
        console.error('Error getting all quizzes:', request.error)
        reject(request.error)
      }
    })
  },
}

/**
 * Journal Storage
 */
export const journalStorage = {
  async saveJournal(entry: JournalEntry): Promise<void> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([JOURNAL_STORE], 'readwrite')
      const store = transaction.objectStore(JOURNAL_STORE)

      const request = store.put(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Error saving journal:', request.error)
        reject(request.error)
      }
    })
  },

  async getJournalByDate(date: string): Promise<JournalEntry | null> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([JOURNAL_STORE], 'readonly')
      const store = transaction.objectStore(JOURNAL_STORE)

      const request = store.get(date)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => {
        console.error('Error getting journal:', request.error)
        reject(request.error)
      }
    })
  },

  async getAllJournals(): Promise<JournalEntry[]> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([JOURNAL_STORE], 'readonly')
      const store = transaction.objectStore(JOURNAL_STORE)

      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => {
        console.error('Error getting all journals:', request.error)
        reject(request.error)
      }
    })
  },

  async deleteJournal(date: string): Promise<void> {
    if (!db) await initIndexedDB()

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([JOURNAL_STORE], 'readwrite')
      const store = transaction.objectStore(JOURNAL_STORE)

      const request = store.delete(date)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Error deleting journal:', request.error)
        reject(request.error)
      }
    })
  },
}

// Initialize IndexedDB when module loads
if (typeof window !== 'undefined') {
  initIndexedDB().catch((error) => {
    console.error('Failed to initialize IndexedDB:', error)
  })
}
