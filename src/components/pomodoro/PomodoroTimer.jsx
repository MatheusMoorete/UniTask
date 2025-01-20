import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react'
import PomodoroSettings from './PomodoroSettings'
import { useState } from 'react'
import { useGlobalPomodoro } from '../../contexts/PomodoroContext'

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const PomodoroTimer = () => {
  const [showSettings, setShowSettings] = useState(false)
  const {
    timeLeft,
    isRunning,
    mode,
    sessionsCompleted,
    settings,
    toggleTimer,
    resetTimer,
    updateSettings
  } = useGlobalPomodoro()

  const handleSettingsSave = (newSettings) => {
    updateSettings(newSettings)
    setShowSettings(false)
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
    <Card className="w-full max-w-[400px] sm:w-[400px]">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="absolute right-2 top-2 sm:right-4 sm:top-4"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Timer Display */}
          <div className="relative flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-muted">
            <div className={`absolute inset-2 rounded-full ${getModeColor()} opacity-10`} />
            <div className="text-3xl sm:text-4xl font-bold">{formatTime(timeLeft)}</div>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center gap-2 text-base sm:text-lg font-medium">
            {getModeIcon()}
            <span>
              {mode === 'focus' ? 'Tempo de Foco' : 
              mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-2 w-full px-4 sm:px-0">
            <Button
              size="lg"
              onClick={toggleTimer}
              className="flex-1 sm:w-24"
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
              className="flex-1 sm:w-24"
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
  )
}

export default PomodoroTimer 