import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PomodoroTimer from '../PomodoroTimer'
import { useGlobalPomodoro } from '@/contexts/PomodoroContext'

// Mock do contexto
vi.mock('@/contexts/PomodoroContext')

describe('PomodoroTimer', () => {
  const mockToggleTimer = vi.fn()
  const mockResetTimer = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useGlobalPomodoro.mockReturnValue({
      timeLeft: 1500, // 25 minutos em segundos
      isRunning: false,
      mode: 'focus',
      sessionsCompleted: 0,
      toggleTimer: mockToggleTimer,
      resetTimer: mockResetTimer
    })
  })

  it('deve renderizar o timer corretamente', () => {
    render(<PomodoroTimer />)
    
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('Tempo de Foco')).toBeInTheDocument()
    expect(screen.getByText('Sessões completadas: 0')).toBeInTheDocument()
  })

  it('deve alternar entre iniciar e pausar', () => {
    render(<PomodoroTimer />)
    
    const button = screen.getByText('Iniciar')
    fireEvent.click(button)
    expect(mockToggleTimer).toHaveBeenCalled()
    
    // Simula timer rodando
    useGlobalPomodoro.mockReturnValue({
      timeLeft: 1500,
      isRunning: true,
      mode: 'focus',
      sessionsCompleted: 0,
      toggleTimer: mockToggleTimer,
      resetTimer: mockResetTimer
    })
    
    render(<PomodoroTimer />)
    expect(screen.getByText('Pausar')).toBeInTheDocument()
  })

  it('deve resetar o timer', () => {
    render(<PomodoroTimer />)
    
    const resetButton = screen.getByText('Resetar')
    fireEvent.click(resetButton)
    expect(mockResetTimer).toHaveBeenCalled()
  })

  it('deve mostrar o modo de pausa curta', () => {
    useGlobalPomodoro.mockReturnValue({
      timeLeft: 300, // 5 minutos em segundos
      isRunning: false,
      mode: 'shortBreak',
      sessionsCompleted: 1,
      toggleTimer: mockToggleTimer,
      resetTimer: mockResetTimer
    })
    
    render(<PomodoroTimer />)
    
    expect(screen.getByText('05:00')).toBeInTheDocument()
    expect(screen.getByText('Pausa Curta')).toBeInTheDocument()
    expect(screen.getByText('Sessões completadas: 1')).toBeInTheDocument()
  })

  it('deve mostrar o modo de pausa longa', () => {
    useGlobalPomodoro.mockReturnValue({
      timeLeft: 900, // 15 minutos em segundos
      isRunning: false,
      mode: 'longBreak',
      sessionsCompleted: 4,
      toggleTimer: mockToggleTimer,
      resetTimer: mockResetTimer
    })
    
    render(<PomodoroTimer />)
    
    expect(screen.getByText('15:00')).toBeInTheDocument()
    expect(screen.getByText('Pausa Longa')).toBeInTheDocument()
    expect(screen.getByText('Sessões completadas: 4')).toBeInTheDocument()
  })
}) 