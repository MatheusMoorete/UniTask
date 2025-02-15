import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PomodoroTimer from '../../../components/pomodoro/PomodoroTimer'
import { useGlobalPomodoro } from '../../../contexts/PomodoroContext'
import { AuthProvider } from '../../../__mocks__/AuthContext'

vi.mock('../../../contexts/PomodoroContext', () => ({
  useGlobalPomodoro: vi.fn()
}))

vi.mock('use-sound', () => ({
  default: () => [vi.fn(), { stop: vi.fn() }]
}))

const mockPomodoro = {
  timeLeft: 1500,
  isRunning: false,
  mode: 'focus',
  sessionsCompleted: 0,
  totalTime: 1500,
  toggleTimer: vi.fn(),
  resetTimer: vi.fn(),
  settings: {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    notificationsEnabled: true,
    dndEnabled: false,
    volume: 50
  }
}

const renderTimer = () => {
  return render(
    <AuthProvider>
      <PomodoroTimer />
    </AuthProvider>
  )
}

describe('PomodoroTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useGlobalPomodoro.mockReturnValue(mockPomodoro)
  })

  it('deve mostrar o tempo restante formatado', () => {
    renderTimer()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('deve iniciar o timer ao clicar no botão de play', () => {
    renderTimer()
    fireEvent.click(screen.getByLabelText('Iniciar'))
    expect(mockPomodoro.toggleTimer).toHaveBeenCalled()
  })

  it('deve pausar o timer ao clicar no botão de pause', () => {
    useGlobalPomodoro.mockReturnValue({ ...mockPomodoro, isRunning: true })
    renderTimer()
    fireEvent.click(screen.getByLabelText('Pausar'))
    expect(mockPomodoro.toggleTimer).toHaveBeenCalled()
  })

  it('deve resetar o timer ao clicar no botão de reset', () => {
    renderTimer()
    fireEvent.click(screen.getByLabelText('Resetar'))
    expect(mockPomodoro.resetTimer).toHaveBeenCalled()
  })

  it('deve mostrar o modo atual', () => {
    renderTimer()
    expect(screen.getByText('Tempo de Foco')).toBeInTheDocument()
  })

  it('deve mostrar o contador de sessões', () => {
    useGlobalPomodoro.mockReturnValue({ ...mockPomodoro, sessionsCompleted: 3 })
    renderTimer()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
}) 