import { createContext, useContext, useState, useEffect } from 'react'
import { usePomodoro } from '../hooks/usePomodoro'
import { useSound } from '../hooks/useSound'
import PropTypes from 'prop-types'

const PomodoroContext = createContext({})

const STORAGE_KEY = 'pomodoro_state'

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  dndEnabled: false,
  volume: 50
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

PomodoroProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export function PomodoroProvider({ children }) {
  const { addSession } = usePomodoro()
  const initialState = loadInitialState()
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft)
  const [isRunning, setIsRunning] = useState(initialState.isRunning)
  const [mode, setMode] = useState(initialState.mode)
  const [sessionsCompleted, setSessionsCompleted] = useState(initialState.sessionsCompleted)
  const [startTime, setStartTime] = useState(initialState.startTime)
  const [settings, setSettings] = useState(initialState.settings || defaultSettings)
  const [worker, setWorker] = useState(null)
  
  // Inicializa os sons com o caminho correto e configurações de tempo
  const { play: playAlarm } = useSound(
    '/public/sounds/alarmclock-bell-ringing-clear-windingdown-000212_0029s3_d-095-099-031-042-35592.mp3', 
    { 
      volume: settings.volume / 100,
      startTime: 3,
      duration: 2
    }
  )
  const { play: playBreak } = useSound(
    '/public/sounds/alarmclock-bell-ringing-clear-windingdown-000212_0029s3_d-095-099-031-042-35592.mp3', 
    { 
      volume: settings.volume / 100,
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

  // Inicializa o Web Worker
  useEffect(() => {
    const timerWorker = new Worker(new URL('../workers/timer.worker.js', import.meta.url))
    
    timerWorker.onmessage = (e) => {
      const { type, timeLeft: newTimeLeft } = e.data
      
      if (type === 'tick') {
        setTimeLeft(newTimeLeft)
      } else if (type === 'complete') {
        handleTimerComplete()
      }
    }

    setWorker(timerWorker)

    return () => {
      timerWorker.terminate()
    }
  }, [])

  // Função para lidar com a conclusão do timer
  const handleTimerComplete = async () => {
    // Toca o som apropriado apenas se estiver habilitado
    if (settings.soundEnabled) {
      if (mode === 'focus') {
        playBreak()
      } else {
        playAlarm()
      }
    }

    // Envia notificação se habilitado
    if (settings.notificationsEnabled && "Notification" in window) {
      let title, body

      switch (mode) {
        case 'focus':
          title = 'Tempo de foco concluído!'
          body = 'Hora de fazer uma pausa!'
          break
        case 'shortBreak':
          title = 'Pausa curta concluída!'
          body = 'Vamos voltar ao foco?'
          break
        case 'longBreak':
          title = 'Pausa longa concluída!'
          body = 'Descansou bem? Hora de voltar aos estudos!'
          break
        default:
          title = 'Sessão concluída!'
          body = 'Hora de continuar!'
      }
      
      try {
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            silent: !settings.soundEnabled
          })
        }
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }
    }
    
    // Salva a sessão completada no Firestore
    const sessionDuration = mode === 'focus' 
      ? settings.focusTime * 60 
      : mode === 'shortBreak' 
        ? settings.shortBreakTime * 60 
        : settings.longBreakTime * 60

    await addSession({
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

  // Controla o timer através do Web Worker
  useEffect(() => {
    if (!worker) return

    if (isRunning) {
      worker.postMessage({
        type: 'start',
        timeLeft,
        interval: 1000
      })
    } else {
      worker.postMessage({ type: 'stop' })
    }
  }, [isRunning, worker])

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(new Date())
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    if (worker) {
      worker.postMessage({ type: 'stop' })
    }
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