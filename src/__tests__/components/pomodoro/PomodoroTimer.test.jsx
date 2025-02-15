import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PomodoroTimer } from '../../../components/pomodoro/PomodoroTimer'
import { usePomodoro } from '../../../hooks/usePomodoro'
import { AuthProvider } from '../../../__mocks__/AuthContext'

vi.mock('../../../hooks/usePomodoro')
vi.mock('use-sound', () => ({
  default: () => [vi.fn(), { stop: vi.fn() }]
}))

const mockPomodoro = {
  isRunning: false,
  isPaused: false,
  mode: 'focus',
  timeLeft: 1500,
  progress: 0,
  sessionCount: 0,
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resetTimer: vi.fn(),
  skipBreak: vi.fn()
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
    usePomodoro.mockReturnValue(mockPomodoro)
  })

  it('deve mostrar o tempo restante formatado', () => {
    renderTimer()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('deve iniciar o timer ao clicar no botão de play', () => {
    renderTimer()
    fireEvent.click(screen.getByLabelText('Iniciar'))
    expect(mockPomodoro.startTimer).toHaveBeenCalled()
  })

  it('deve pausar o timer ao clicar no botão de pause', () => {
    usePomodoro.mockReturnValue({ ...mockPomodoro, isRunning: true })
    renderTimer()
    fireEvent.click(screen.getByLabelText('Pausar'))
    expect(mockPomodoro.pauseTimer).toHaveBeenCalled()
  })

  it('deve resetar o timer ao clicar no botão de reset', () => {
    renderTimer()
    fireEvent.click(screen.getByLabelText('Resetar'))
    expect(mockPomodoro.resetTimer).toHaveBeenCalled()
  })

  it('deve mostrar o modo atual', () => {
    renderTimer()
    expect(screen.getByText('Foco')).toBeInTheDocument()
  })

  it('deve mostrar o progresso do timer', () => {
    usePomodoro.mockReturnValue({ ...mockPomodoro, progress: 50 })
    renderTimer()
    const progressCircle = screen.getByTestId('progress-circle')
    expect(progressCircle).toHaveAttribute('stroke-dashoffset', expect.any(String))
  })

  it('deve mostrar o contador de sessões', () => {
    usePomodoro.mockReturnValue({ ...mockPomodoro, sessionCount: 3 })
    renderTimer()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('deve permitir pular o intervalo', () => {
    usePomodoro.mockReturnValue({ ...mockPomodoro, mode: 'break' })
    renderTimer()
    fireEvent.click(screen.getByText('Pular'))
    expect(mockPomodoro.skipBreak).toHaveBeenCalled()
  })
}) 