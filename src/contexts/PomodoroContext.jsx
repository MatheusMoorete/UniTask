import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePomodoro, usePomodoroSound } from '../hooks/usePomodoro'
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
  
  const playSound = usePomodoroSound(settings.soundEnabled, settings.volume)

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações desktop")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }, [])

  // Verifica permissão quando as notificações são habilitadas
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermission()
    }
  }, [settings.notificationsEnabled, requestNotificationPermission])

  // Função para enviar notificação com tratamento de erro
  const sendNotification = useCallback((title, body) => {
    if (settings.notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          silent: !settings.soundEnabled
        })
      } catch (error) {
        console.error('Erro ao enviar notificação:', error)
      }
    }
  }, [settings.notificationsEnabled, settings.soundEnabled])

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
    // Toca o som de finalização
    if (settings.soundEnabled) {
      try {
        playSound()
      } catch (error) {
        console.error('Erro ao tocar som:', error)
      }
    }

    // Prepara notificação baseada no modo atual
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
    
    sendNotification(title, body)
    
    // Calcula a duração da sessão atual
    const sessionDuration = mode === 'focus' 
      ? settings.focusTime * 60 
      : mode === 'shortBreak' 
        ? settings.shortBreakTime * 60 
        : settings.longBreakTime * 60

    // Registra a sessão no Firestore
    try {
      await addSession({
        type: mode,
        duration: sessionDuration,
        startedAt: startTime || new Date(Date.now() - sessionDuration * 1000),
        completedAt: new Date(),
        settings: { ...settings }
      })
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
    }
    
    // Lógica de transição entre modos
    if (mode === 'focus') {
      // Incrementa contador apenas quando completa um período de foco
      const newSessions = sessionsCompleted + 1
      setSessionsCompleted(newSessions)
      
      // Determina o próximo modo (pausa curta ou longa)
      const isLongBreakDue = newSessions % settings.sessionsUntilLongBreak === 0
      const nextMode = isLongBreakDue ? 'longBreak' : 'shortBreak'
      const nextDuration = isLongBreakDue ? settings.longBreakTime : settings.shortBreakTime
      
      setMode(nextMode)
      setTimeLeft(nextDuration * 60)
      
      console.log(`Sessão de foco ${newSessions} completada. Iniciando ${nextMode}`)
    } else {
      // Após qualquer pausa, sempre volta para foco
      setMode('focus')
      setTimeLeft(settings.focusTime * 60)
      
      console.log('Pausa completada. Voltando para foco')
    }
    
    // Para o timer e limpa o tempo inicial
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

    const handleWorkerMessage = (e) => {
      const { type, timeLeft: newTimeLeft } = e.data
      if (type === 'tick') {
        setTimeLeft(newTimeLeft)
      } else if (type === 'complete') {
        handleTimerComplete()
      }
    }

    worker.onmessage = handleWorkerMessage

    if (isRunning) {
      console.log(`Iniciando timer: ${timeLeft} segundos`)
      worker.postMessage({
        type: 'start',
        timeLeft,
        interval: 1000
      })
    } else {
      console.log('Parando timer')
      worker.postMessage({ type: 'stop' })
    }

    return () => {
      worker.onmessage = null
    }
  }, [isRunning, worker, timeLeft, handleTimerComplete])

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(new Date())
      setIsRunning(true)
    } else {
      setIsRunning(false)
    }
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

  const value = {
    timeLeft,
    isRunning,
    mode,
    sessionsCompleted,
    settings,
    totalTime: getTotalTime(),
    toggleTimer,
    resetTimer,
    updateSettings
  }

  return (
    <PomodoroContext.Provider value={value}>
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