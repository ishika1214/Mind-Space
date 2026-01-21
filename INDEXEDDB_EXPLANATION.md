# IndexedDB Implementation Explanation

## Overview

The Mind Space app uses **IndexedDB** as its primary storage mechanism for mood entries. This document explains how IndexedDB works and how it's implemented in this project.

## What is IndexedDB?

IndexedDB is a low-level API for client-side storage of large amounts of structured data. Unlike LocalStorage (which stores strings), IndexedDB stores JavaScript objects directly.

### Key Advantages

- ✅ **Stores objects directly** - No need for JSON.stringify/parse
- ✅ **Large storage capacity** - Typically 50% of available disk space (vs 5-10MB for LocalStorage)
- ✅ **Better performance** - Especially for large datasets
- ✅ **Indexed queries** - Can search/filter efficiently using indexes
- ✅ **Transactional** - All-or-nothing operations ensure data integrity
- ✅ **Asynchronous** - Non-blocking operations

## Architecture

### Database Structure

```
MindSpaceDB (Database)
└── moods (Object Store)
    ├── Key: date (YYYY-MM-DD format)
    └── Value: MoodEntry object
        ├── date: string
        ├── mood: string (emoji)
        └── note?: string (optional)
```

### Components

1. **Database**: `MindSpaceDB` (version 1)
2. **Object Store**: `moods` (like a table)
3. **Primary Key**: `date` field (ensures one entry per day)

## How It Works

### 1. Initialization (`initIndexedDB`)

```typescript
// Opens database, creates if doesn't exist
const request = indexedDB.open('MindSpaceDB', 1)

// Runs when database is created or version changes
request.onupgradeneeded = (event) => {
  const db = event.target.result
  // Create 'moods' object store with 'date' as primary key
  db.createObjectStore('moods', { keyPath: 'date' })
}

// Runs when database is ready
request.onsuccess = () => {
  db = request.result // Store connection for reuse
}
```

**What happens:**
- First time: Creates database and object store
- Subsequent times: Opens existing database
- Singleton pattern ensures only one connection

### 2. Saving Data (`saveMood`)

```typescript
// Create readwrite transaction (exclusive)
const transaction = db.transaction(['moods'], 'readwrite')
const store = transaction.objectStore('moods')

// Put entry (inserts or updates)
const request = store.put({
  date: '2024-01-20',
  mood: '😊',
  note: 'Feeling great!'
})
```

**What happens:**
- Creates a transaction (ensures data integrity)
- Uses `put()` which:
  - Inserts if entry doesn't exist
  - Updates if entry with same key exists
- Returns Promise that resolves when complete

### 3. Reading Data (`getMoodByDate`)

```typescript
// Create readonly transaction (allows concurrent reads)
const transaction = db.transaction(['moods'], 'readonly')
const store = transaction.objectStore('moods')

// Get entry by primary key (very fast!)
const request = store.get('2024-01-20')
```

**What happens:**
- Uses primary key lookup (O(1) complexity)
- Much faster than scanning all entries
- Returns Promise<MoodEntry | null>

### 4. Getting All Data (`getAllMoods`)

```typescript
const transaction = db.transaction(['moods'], 'readonly')
const store = transaction.objectStore('moods')

// Get all entries
const request = store.getAll()
```

**What happens:**
- Retrieves all entries from object store
- Returns Promise<MoodEntry[]>
- Used for streak calculation and calendar view

## Transaction Types

### Readonly Transaction
- **Use**: Reading data
- **Performance**: Faster, allows concurrent reads
- **Example**: `getMoodByDate()`, `getAllMoods()`

### Readwrite Transaction
- **Use**: Writing data
- **Performance**: Slower, exclusive (one at a time)
- **Example**: `saveMood()`, `deleteMood()`

## Data Flow Example

### Saving a Mood Entry

```
User clicks "Save Mood"
    ↓
handleSaveMood() called
    ↓
storage.saveMood(entry)
    ↓
initIndexedDB() (if needed)
    ↓
Create readwrite transaction
    ↓
Get 'moods' object store
    ↓
store.put(entry) - Insert/Update
    ↓
Transaction completes
    ↓
Promise resolves
    ↓
loadMoods() - Refresh UI
```

### Loading Mood Data

```
Component mounts
    ↓
loadMoods() called
    ↓
storage.getMoodByDate(today) - Get today's entry
storage.getAllMoods() - Get all entries for calendar
storage.getStreak() - Calculate streak
storage.getWeeklyData() - Get last 7 days
    ↓
All Promises resolve
    ↓
Update React state
    ↓
UI re-renders with data
```

## Performance Considerations

### Why IndexedDB is Better Than LocalStorage

| Feature | LocalStorage | IndexedDB |
|---------|-------------|-----------|
| Storage Limit | ~5-10MB | ~50% of disk |
| Data Type | Strings only | Objects |
| Performance | Sync (blocks) | Async (non-blocking) |
| Queries | Manual filtering | Indexed lookups |
| Transactions | No | Yes |

### Optimizations Used

1. **Primary Key Lookup**: `getMoodByDate()` uses primary key (O(1))
2. **Batch Loading**: Load all moods once for calendar view
3. **Singleton Connection**: Reuse database connection
4. **Readonly Transactions**: Use for reads (faster, concurrent)

## Error Handling

All IndexedDB operations include error handling:

```typescript
try {
  await storage.saveMood(entry)
  await loadMoods()
} catch (error) {
  console.error('Error saving mood:', error)
  // Show user-friendly error message
}
```

## Browser Support

IndexedDB is supported in:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (iOS 10+, macOS 10.12+)
- ✅ Opera (all versions)

## Migration from LocalStorage

If you had data in LocalStorage, you could migrate it:

```typescript
// Migration function (run once)
async function migrateFromLocalStorage() {
  const oldData = localStorage.getItem('mind-space-moods')
  if (oldData) {
    const moods = JSON.parse(oldData)
    for (const mood of moods) {
      await storage.saveMood(mood)
    }
    localStorage.removeItem('mind-space-moods')
  }
}
```

## Debugging

### View IndexedDB in Browser

1. **Chrome/Edge**: DevTools → Application → IndexedDB → MindSpaceDB
2. **Firefox**: DevTools → Storage → IndexedDB → MindSpaceDB
3. **Safari**: DevTools → Storage → IndexedDB → MindSpaceDB

### Common Issues

1. **Database not initializing**: Check browser console for errors
2. **Data not saving**: Verify transaction completed successfully
3. **Quota exceeded**: Very rare, but possible with huge datasets

## Summary

IndexedDB provides a robust, scalable storage solution for the Mind Space app. It handles:
- ✅ Daily mood entries
- ✅ Optional notes
- ✅ Fast lookups by date
- ✅ Efficient calendar rendering
- ✅ Streak calculations
- ✅ Weekly chart data

All data is stored locally on the user's device, ensuring complete privacy and offline functionality.
