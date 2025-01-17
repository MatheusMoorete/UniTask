import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react'
import PomodoroSettings from './PomodoroSettings'
import { usePomodoro } from '../../hooks/usePomodoro'

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const PomodoroTimer = ({ defaultSettings }) => {
  const { addSession } = usePomodoro()
  const [settings, setSettings] = useState(defaultSettings)
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('focus') // focus, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [startTime, setStartTime] = useState(null)

  // Atualiza o timer quando as configurações mudam
  useEffect(() => {
    if (mode === 'focus') {
      setTimeLeft(settings.focusTime * 60)
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreakTime * 60)
    } else if (mode === 'longBreak') {
      setTimeLeft(settings.longBreakTime * 60)
    }
  }, [settings, mode])

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
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

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings)
    setShowSettings(false)
    
    // Se o timer não estiver rodando, atualiza o tempo restante
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

  const getModeIcon = () => {
    switch (mode) {
      case 'focus':
        return <Brain className="h-6 w-6" />
      case 'shortBreak':
      case 'longBreak':
        return <Coffee className="h-6 w-6" />
      default:
        return <Timer className="h-6 w-6" />
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return 'bg-red-500'
      case 'shortBreak':
        return 'bg-green-500'
      case 'longBreak':
        return 'bg-blue-500'
      default:
        return 'bg-primary'
    }
  }

  return (
    <div className="relative">
      <Card className="w-[400px]">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6">
            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="absolute right-4 top-4"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Timer Display */}
            <div className="relative flex items-center justify-center w-48 h-48 rounded-full border-4 border-muted">
              <div className={`absolute inset-2 rounded-full ${getModeColor()} opacity-10`} />
              <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
            </div>

            {/* Mode Indicator */}
            <div className="flex items-center gap-2 text-lg font-medium">
              {getModeIcon()}
              <span>
                {mode === 'focus' ? 'Tempo de Foco' : 
                mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-24"
              >
                {isRunning ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Pausar' : 'Iniciar'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="w-24"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>

            {/* Sessions Counter */}
            <div className="text-sm text-muted-foreground">
              Sessões completadas: {sessionsCompleted}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative">
            <PomodoroSettings
              settings={settings}
              onSave={handleSettingsSave}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PomodoroTimer 