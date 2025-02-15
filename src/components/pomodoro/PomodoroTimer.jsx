import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react'
import { PomodoroSettings } from './PomodoroSettings'
import { useEffect } from 'react'
import { useGlobalPomodoro } from '../../contexts/PomodoroContext'

const PomodoroTimer = () => {
  const {
    timeLeft,
    isRunning,
    mode,
    sessionsCompleted,
    toggleTimer,
    resetTimer,
    totalTime
  } = useGlobalPomodoro()

  // Calcular progresso em porcentagem
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const progress = 100 - ((timeLeft / totalTime) * 100)
  const strokeDashoffset = (circumference * progress) / 100

  // Solicitar permissão para notificações
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission()
    }
  }, [])

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
        return <Brain className="h-6 w-6" />
    }
  }

  return (
    <Card className="w-full relative overflow-hidden">
      <PomodoroSettings />
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-8">
          {/* Círculo Progressivo */}
          <div className="relative w-full max-w-[300px] aspect-square">
            <svg 
              className="w-full h-full -rotate-90"
              viewBox="0 0 300 300"
            >
              <circle
                className="text-muted/20 stroke-current"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="150"
                cy="150"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="150"
                cy="150"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ 
                  transition: isRunning ? "stroke-dashoffset 1s linear" : "none"
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold tabular-nums mb-2">
                {formatTimeLeft()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getModeIcon()}
                <span>
                  {mode === 'focus' ? 'Tempo de Foco' :
                   mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full">
            <Button 
              onClick={toggleTimer}
              className="flex-1 flex items-center justify-center gap-2 h-12"
              variant={isRunning ? "outline" : "default"}
              size="lg"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Iniciar
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetTimer}
              size="icon"
              className="h-12 w-12"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {/* Sessions Counter */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Sessões completadas: {sessionsCompleted}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PomodoroTimer 