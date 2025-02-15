import { createContext, useContext, useState, useEffect } from 'react'
import { usePomodoro } from '../hooks/usePomodoro'
import { useSound } from '../hooks/useSound'
import { useFirestore } from './FirestoreContext'

const PomodoroContext = createContext({})

const STORAGE_KEY = 'pomodoro_state'

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true
}

// Função para carregar o estado inicial do localStorage
const loadInitialState = () => {
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    const state = JSON.parse(savedState)
    // Converte as strings de data de volta para objetos Date
    if (state.startTime) {
      state.startTime = new Date(state.startTime)
    }
    return {
      ...state,
      settings: state.settings || defaultSettings
    }
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

export function PomodoroProvider({ children }) {
  const { db } = useFirestore()
  const initialState = loadInitialState()
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft)
  const [isRunning, setIsRunning] = useState(initialState.isRunning)
  const [mode, setMode] = useState(initialState.mode)
  const [sessionsCompleted, setSessionsCompleted] = useState(initialState.sessionsCompleted)
  const [startTime, setStartTime] = useState(initialState.startTime)
  const [lastTickTime, setLastTickTime] = useState(null)
  const [settings, setSettings] = useState(initialState.settings || defaultSettings)
  
  const { addSession } = usePomodoro()

  // Inicializa os sons com o caminho correto e configurações de tempo
  const { play: playAlarm } = useSound(
    '/public/sounds/alarmclock-bell-ringing-clear-windingdown-000212_0029s3_d-095-099-031-042-35592.mp3', 
    { 
      volume: 0.7,
      startTime: 3,
      duration: 2
    }
  )
  const { play: playBreak } = useSound(
    '/public/sounds/alarmclock-bell-ringing-clear-windingdown-000212_0029s3_d-095-099-031-042-35592.mp3', 
    { 
      volume: 0.7,
      startTime: 3,
      duration: 2
    }
  )

  // Calcula o tempo total baseado no modo atual
  const getTotalTime = () => {
    switch (mode) {
      case 'focus':
        return settings.focusTime * 60
      case 'shortBreak':
        return settings.shortBreakTime * 60
      case 'longBreak':
        return settings.longBreakTime * 60
      default:
        return settings.focusTime * 60
    }
  }

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
    let animationFrameId

    const updateTimer = () => {
      if (isRunning && timeLeft > 0) {
        const now = Date.now()
        
        if (!lastTickTime) {
          setLastTickTime(now)
        } else {
          const deltaTime = Math.floor((now - lastTickTime) / 1000)
          
          if (deltaTime >= 1) {
            const newTimeLeft = Math.max(0, timeLeft - deltaTime)
            setTimeLeft(newTimeLeft)
            setLastTickTime(now)
          }
        }

        animationFrameId = requestAnimationFrame(updateTimer)
      } else if (timeLeft === 0 && isRunning) {
        // Toca o som apropriado apenas se estiver habilitado
        if (settings.soundEnabled) {
          if (mode === 'focus') {
            playBreak()
          } else {
            playAlarm()
          }
        }
        
        // Salva a sessão completada no Firestore
        const sessionDuration = mode === 'focus' 
          ? settings.focusTime * 60 
          : mode === 'shortBreak' 
            ? settings.shortBreakTime * 60 
            : settings.longBreakTime * 60

        addSession({
          type: mode,
          duration: sessionDuration,
          startedAt: startTime,
          completedAt: new Date(),
          settings: { ...settings }
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
        setLastTickTime(null)
      }
    }

    if (isRunning) {
      animationFrameId = requestAnimationFrame(updateTimer)
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isRunning, timeLeft, mode, sessionsCompleted, settings, addSession, startTime, playAlarm, playBreak, lastTickTime])

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(new Date())
      setLastTickTime(Date.now())
    } else {
      setLastTickTime(null)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setMode('focus')
    setTimeLeft(settings.focusTime * 60)
    setSessionsCompleted(0)
    setStartTime(null)
    setLastTickTime(null)
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
        clearSavedState,
        totalTime: getTotalTime()
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