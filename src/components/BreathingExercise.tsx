import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { getThemeClasses } from '../utils/themeUtils'

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest'

const PHASE_DURATIONS = {
  inhale: 4000, // 4 seconds
  hold: 4000,   // 4 seconds
  exhale: 4000, // 4 seconds
  rest: 1000,   // 1 second rest
}

const PHASE_LABELS = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  rest: 'Rest',
}

export default function BreathingExercise() {
  const { colors } = useTheme()
  const themeClasses = getThemeClasses(colors)
  const [phase, setPhase] = useState<Phase>('inhale')
  const [isRunning, setIsRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const intervalRef = useRef<number | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const isRunningRef = useRef(false)

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    } else {
      setVoiceEnabled(false)
      console.warn('Speech synthesis not supported in this browser')
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Keep ref in sync with state
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  const speak = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return
    
    // Cancel any ongoing speech
    synthRef.current.cancel()

    // Check if speech synthesis is available and running
    if (!isRunningRef.current) return

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      utterance.lang = 'en-US'

      // Handle errors
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        if (event.error === 'not-allowed') {
          setVoiceEnabled(false)
        }
      }

      synthRef.current.speak(utterance)
    } catch (error) {
      console.error('Error speaking:', error)
      setVoiceEnabled(false)
    }
  }

  const startBreathing = () => {
    setIsRunning(true)
    isRunningRef.current = true
    setCycleCount(0)
    setPhase('inhale')
    
    // Cancel any existing speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    
    // Start first prompt immediately (within user interaction context)
    setTimeout(() => {
      speak('Begin breathing exercise. Breathe in.')
    }, 100)
    
    let currentPhase: Phase = 'inhale'
    let phaseStartTime = Date.now()

    const updatePhase = () => {
      if (!isRunningRef.current) return

      const elapsed = Date.now() - phaseStartTime
      const duration = PHASE_DURATIONS[currentPhase]

      if (elapsed >= duration) {
        // Move to next phase
        switch (currentPhase) {
          case 'inhale':
            currentPhase = 'hold'
            setPhase('hold')
            setTimeout(() => speak('Hold'), 50)
            break
          case 'hold':
            currentPhase = 'exhale'
            setPhase('exhale')
            setTimeout(() => speak('Breathe out'), 50)
            break
          case 'exhale':
            currentPhase = 'rest'
            setPhase('rest')
            setCycleCount((prev) => prev + 1)
            break
          case 'rest':
            currentPhase = 'inhale'
            setPhase('inhale')
            setTimeout(() => speak('Breathe in'), 50)
            break
        }
        phaseStartTime = Date.now()
      }
    }

    intervalRef.current = window.setInterval(updatePhase, 100)
  }

  const stopBreathing = () => {
    setIsRunning(false)
    isRunningRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setPhase('inhale')
  }

  const getCircleSize = () => {
    switch (phase) {
      case 'inhale':
        return 'scale(1.5)'
      case 'hold':
        return 'scale(1.5)'
      case 'exhale':
        return 'scale(1)'
      case 'rest':
        return 'scale(1)'
      default:
        return 'scale(1)'
    }
  }

  const getAnimationClass = () => {
    switch (phase) {
      case 'inhale':
        return 'animate-breathe-in'
      case 'hold':
        return 'animate-breathe-hold'
      case 'exhale':
        return 'animate-breathe-out'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="breathing-gradient rounded-xl shadow-lg p-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Breathing Circle */}
        <div
          className={`w-64 h-64 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center transition-transform duration-[4000ms] ease-in-out ${getAnimationClass()}`}
          style={{
            transform: getCircleSize(),
          }}
        >
          <div className="w-48 h-48 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">{PHASE_LABELS[phase]}</p>
              <p className="text-white/80 text-sm">Cycle {cycleCount + 1}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-white text-lg font-semibold mb-2">
            {phase === 'inhale' && '✨ Inhale slowly through your nose'}
            {phase === 'hold' && '⏸️ Hold your breath'}
            {phase === 'exhale' && '💨 Exhale slowly through your mouth'}
            {phase === 'rest' && '🌊 Take a moment'}
          </p>
          <p className="text-white/80 text-sm">4-4-4 Breathing Pattern</p>
        </div>
      </div>

      {/* Controls */}
      <div className={`${themeClasses.card} rounded-xl shadow-md p-6 border ${themeClasses.border}`}>
        <div className="flex flex-col items-center space-y-4">
          {!isRunning ? (
            <button
              onClick={startBreathing}
              className={`w-full ${themeClasses.primaryBg} text-white py-4 rounded-lg font-semibold text-lg ${themeClasses.primaryBgHover} transition-colors`}
            >
              Start Breathing Exercise
            </button>
          ) : (
            <button
              onClick={stopBreathing}
              className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-red-600 transition-colors"
            >
              Stop Exercise
            </button>
          )}

          <div className={`text-center ${themeClasses.textSecondary}`}>
            <p className="text-sm">Completed Cycles: <span className={`font-bold ${themeClasses.primary}`}>{cycleCount}</span></p>
          </div>
        </div>

        {/* Instructions Card */}
        <div className={`mt-6 p-4 ${themeClasses.primaryBgLight} rounded-lg border ${themeClasses.primaryBorder}`}>
          <h3 className={`font-semibold ${themeClasses.text} mb-2`}>How to use:</h3>
          <ul className={`text-sm ${themeClasses.textSecondary} space-y-1 list-disc list-inside`}>
            <li>Click "Start" to begin the 4-4-4 breathing exercise</li>
            <li>Follow the expanding and contracting circle</li>
            <li>Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds</li>
            {voiceEnabled ? (
              <li>The app will guide you with voice prompts</li>
            ) : (
              <li className="text-orange-600 dark:text-orange-400">Voice prompts disabled (not supported or blocked by browser)</li>
            )}
            <li>Continue for as many cycles as you need</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
