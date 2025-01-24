import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react'
import { PomodoroSettings } from './PomodoroSettings'
import { useState } from 'react'
import { useGlobalPomodoro } from '../../contexts/PomodoroContext'

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const PomodoroTimer = () => {
  const {
    timeLeft,
    isRunning,
    mode,
    sessionsCompleted,
    toggleTimer,
    resetTimer
  } = useGlobalPomodoro()

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
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
    <Card className="w-full max-w-sm relative">
      <PomodoroSettings />
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-6">
          {/* Timer Display */}
          <div className="text-4xl font-bold tabular-nums">
            {formatTimeLeft()}
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4" />
            <span>
              {mode === 'focus' ? 'Tempo de Foco' :
               mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={toggleTimer}>
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button variant="outline" onClick={resetTimer}>
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