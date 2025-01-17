import { createContext, useContext, useState, useEffect } from 'react'
import { usePomodoro } from '../hooks/usePomodoro'

const PomodoroContext = createContext({})

const STORAGE_KEY = 'pomodoro_state'

// Função para carregar o estado inicial do localStorage
const loadInitialState = (defaultSettings) => {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    const state = JSON.parse(savedState)
    // Converte as strings de data de volta para objetos Date
    if (state.startTime) {
      state.startTime = new Date(state.startTime)
    }
    return state
  }
  return {
    timeLeft: defaultSettings.focusTime * 60,
    isRunning: false,
    mode: 'focus',
    sessionsCompleted: 0,
    startTime: null,
    settings: defaultSettings
  }
}

export function PomodoroProvider({ children, defaultSettings }) {
  const initialState = loadInitialState(defaultSettings)
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft)
  const [isRunning, setIsRunning] = useState(initialState.isRunning)
  const [mode, setMode] = useState(initialState.mode)
  const [sessionsCompleted, setSessionsCompleted] = useState(initialState.sessionsCompleted)
  const [startTime, setStartTime] = useState(initialState.startTime)
  const [settings, setSettings] = useState(initialState.settings)
  
  const { addSession } = usePomodoro()

  // Salva o estado no localStorage sempre que houver mudanças
  useEffect(() => {
    const state = {
      timeLeft,
      isRunning,
      mode,
      sessionsCompleted,
      startTime,
      settings
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [timeLeft, isRunning, mode, sessionsCompleted, startTime, settings])

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      // Play notification sound
      const audio = new Audio('/notification.mp3')
      audio.play()
      
      // Salva a sessão completada
      const sessionDuration = mode === 'focus' 
        ? settings.focusTime * 60 
        : mode === 'shortBreak' 
          ? settings.shortBreakTime * 60 
          : settings.longBreakTime * 60

      addSession({
        type: mode,
        duration: sessionDuration,
        startedAt: startTime,
        completedAt: new Date()
      })
      
      // Switch modes
      if (mode === 'focus') {
        const newSessions = sessionsCompleted + 1
        setSessionsCompleted(newSessions)
        
        if (newSessions % settings.sessionsUntilLongBreak === 0) {
          setMode('longBreak')
          setTimeLeft(settings.longBreakTime * 60)
        } else {
          setMode('shortBreak')
          setTimeLeft(settings.shortBreakTime * 60)
        }
      } else {
        setMode('focus')
        setTimeLeft(settings.focusTime * 60)
      }
      setIsRunning(false)
      setStartTime(null)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode, sessionsCompleted, settings, addSession, startTime])

  const toggleTimer = () => {
    if (!isRunning && !startTime) {
      setStartTime(new Date())
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setMode('focus')
    setTimeLeft(settings.focusTime * 60)
    setSessionsCompleted(0)
    setStartTime(null)
  }

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
    if (!isRunning) {
      if (mode === 'focus') {
        setTimeLeft(newSettings.focusTime * 60)
      } else if (mode === 'shortBreak') {
        setTimeLeft(newSettings.shortBreakTime * 60)
      } else if (mode === 'longBreak') {
        setTimeLeft(newSettings.longBreakTime * 60)
      }
    }
  }

  // Função para limpar o estado salvo (útil para debugging ou reset manual)
  const clearSavedState = () => {
    localStorage.removeItem(STORAGE_KEY)
    resetTimer()
  }

  return (
    <PomodoroContext.Provider
      value={{
        timeLeft,
        isRunning,
        mode,
        sessionsCompleted,
        settings,
        toggleTimer,
        resetTimer,
        updateSettings,
        clearSavedState
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export const useGlobalPomodoro = () => {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error('useGlobalPomodoro must be used within a PomodoroProvider')
  }
  return context
} 