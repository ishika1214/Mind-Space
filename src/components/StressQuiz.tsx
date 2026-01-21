import { useState } from 'react'
import { format } from 'date-fns'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/themeUtils'
import { stressQuizStorage, StressQuizEntry } from '../utils/storage'

interface Question {
  id: number
  text: string
}

const QUESTIONS: Question[] = [
  { id: 1, text: 'I feel overwhelmed by my responsibilities' },
  { id: 2, text: 'I have trouble falling or staying asleep' },
  { id: 3, text: 'I feel irritable or easily frustrated' },
  { id: 4, text: 'I have difficulty concentrating on tasks' },
  { id: 5, text: 'I experience physical symptoms like headaches or muscle tension' },
  { id: 6, text: 'I feel anxious or worried about the future' },
  { id: 7, text: 'I have trouble making decisions' },
  { id: 8, text: 'I feel like I have too much to do and not enough time' },
  { id: 9, text: 'I avoid social situations or activities I used to enjoy' },
  { id: 10, text: 'I feel exhausted even after getting enough sleep' },
]

const SCALE_OPTIONS = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
]

type Answers = Record<number, number>

const STRESS_LEVELS = {
  LOW: { min: 10, max: 25, label: 'Low', color: 'green', emoji: '😌' },
  MODERATE: { min: 26, max: 40, label: 'Moderate', color: 'yellow', emoji: '😐' },
  HIGH: { min: 41, max: 50, label: 'High', color: 'red', emoji: '😰' },
}

const SUGGESTIONS = {
  LOW: [
    'Great job managing your stress!',
    'Continue practicing mindfulness and self-care',
    'Maintain healthy routines and boundaries',
    'Consider journaling to track your well-being',
  ],
  MODERATE: [
    'Take regular breaks throughout your day',
    'Practice deep breathing exercises daily',
    'Consider time management techniques',
    'Engage in physical activity or gentle movement',
    'Limit caffeine and ensure adequate sleep',
    'Try meditation or mindfulness apps',
  ],
  HIGH: [
    'Prioritize self-care and rest',
    'Consider speaking with a mental health professional',
    'Practice breathing exercises multiple times daily',
    'Break tasks into smaller, manageable steps',
    'Set clear boundaries and learn to say no',
    'Engage in activities that bring you joy',
    'Consider reducing commitments and responsibilities',
    'Ensure you\'re getting adequate sleep and nutrition',
  ],
}

export default function StressQuiz() {
  const { colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const [answers, setAnswers] = useState<Answers>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const calculateScore = (): number => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }

  const getStressLevel = (totalScore: number) => {
    if (totalScore <= STRESS_LEVELS.LOW.max) return STRESS_LEVELS.LOW
    if (totalScore <= STRESS_LEVELS.MODERATE.max) return STRESS_LEVELS.MODERATE
    return STRESS_LEVELS.HIGH
  }

  const handleSubmit = async () => {
    const totalScore = calculateScore()
    const stressLevel = getStressLevel(totalScore)
    
    setScore(totalScore)
    setShowResults(true)

    // Save quiz result to IndexedDB
    try {
      const entry: StressQuizEntry = {
        date: format(new Date(), 'yyyy-MM-dd'),
        score: totalScore,
        level: stressLevel.label as 'Low' | 'Moderate' | 'High',
        answers: { ...answers },
        timestamp: Date.now(),
      }
      await stressQuizStorage.saveQuizResult(entry)
    } catch (error) {
      console.error('Error saving quiz result:', error)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
    setScore(0)
  }

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined)
  const stressLevel = showResults ? getStressLevel(score) : null

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
        <h2 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>Stress Self-Assessment</h2>
        <p className={`${themeClasses.textSecondary} text-sm mb-6`}>
          This quiz helps you become aware of your stress levels. It is not a medical diagnosis.
          Please answer honestly based on how you've been feeling recently.
        </p>

        {!showResults ? (
          <>
            <div className="space-y-6">
              {QUESTIONS.map((question) => (
                <div key={question.id} className={`border-b ${themeClasses.border} pb-4`}>
                  <p className={`font-medium ${themeClasses.text} mb-3`}>
                    {question.id}. {question.text}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SCALE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(question.id, option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          answers[question.id] === option.value
                            ? `${themeClasses.primaryBg} text-white`
                            : `bg-gray-100 dark:bg-slate-700 ${themeClasses.text} hover:bg-gray-200 dark:hover:bg-slate-600`
                        }`}
                      >
                        {option.value} - {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={`w-full ${themeClasses.primaryBg} text-white py-3 rounded-lg font-semibold ${themeClasses.primaryBgHover} transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
              >
                {allAnswered ? 'View Results' : `Please answer all ${QUESTIONS.length} questions`}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Results */}
            <div className={`rounded-xl p-6 text-center ${
              stressLevel?.color === 'green' ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800' :
              stressLevel?.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800' :
              'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800'
            }`}>
              <div className="text-6xl mb-4">{stressLevel?.emoji}</div>
              <h3 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
                Stress Level: {stressLevel?.label}
              </h3>
              <p className={themeClasses.textSecondary}>
                Your score: <span className="font-bold">{score}</span> / 50
              </p>
            </div>

            {/* Suggestions */}
            <div className={`${themeClasses.card} border ${themeClasses.border} rounded-xl p-6`}>
              <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>Personalized Suggestions</h3>
              <ul className="space-y-3">
                {stressLevel && SUGGESTIONS[stressLevel.label.toUpperCase() as keyof typeof SUGGESTIONS].map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`${themeClasses.primary} mr-2`}>•</span>
                    <span className={themeClasses.text}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className={`flex-1 bg-gray-200 dark:bg-slate-700 ${themeClasses.text} py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors`}
              >
                Retake Quiz
              </button>
              <button
                onClick={() => window.location.href = '/breathing'}
                className={`flex-1 ${themeClasses.primaryBg} text-white py-3 rounded-lg font-semibold ${themeClasses.primaryBgHover} transition-colors`}
              >
                Try Breathing Exercise
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> This assessment is for awareness purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing persistent stress or mental health concerns, please consult with a qualified healthcare provider.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
