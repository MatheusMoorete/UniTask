import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PomodoroProvider, useGlobalPomodoro } from '../../contexts/PomodoroContext'
import { useFirestore } from '../../contexts/FirestoreContext'
import { AuthProvider } from '../../__mocks__/AuthContext'

// Mock do Firestore
vi.mock('../../contexts/FirestoreContext', () => ({
  useFirestore: vi.fn()
}))

// Mock do onSnapshot
const mockOnSnapshot = vi.fn()
const mockCollection = vi.fn()
const mockAddDoc = vi.fn()

// Componente de teste
const TestComponent = () => {
  const { timeLeft, isRunning, mode, sessionsCompleted, toggleTimer } = useGlobalPomodoro()
  return (
    <div>
      <span data-testid="time-left">{timeLeft}</span>
      <span data-testid="mode">{mode}</span>
      <span data-testid="sessions">{sessionsCompleted}</span>
      <button onClick={toggleTimer}>
        {isRunning ? 'Pausar' : 'Iniciar'}
      </button>
    </div>
  )
}

describe('PomodoroContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    useFirestore.mockReturnValue({
      db: {},
      collection: mockCollection,
      addDoc: mockAddDoc,
      onSnapshot: mockOnSnapshot
    })
  })

  const renderWithProvider = (Component) => {
    return render(
      <AuthProvider>
        <PomodoroProvider>
          {Component}
        </PomodoroProvider>
      </AuthProvider>
    )
  }

  describe('Estado Inicial', () => {
    it('deve inicializar com valores padrão', () => {
      renderWithProvider(<TestComponent />)
      
      expect(screen.getByTestId('time-left')).toHaveTextContent('1500') // 25 minutos
      expect(screen.getByTestId('mode')).toHaveTextContent('focus')
      expect(screen.getByTestId('sessions')).toHaveTextContent('0')
    })

    it('deve recuperar estado do localStorage', () => {
      localStorage.setItem('pomodoro_state', JSON.stringify({
        timeLeft: 1200,
        mode: 'shortBreak',
        sessionsCompleted: 2
      }))

      renderWithProvider(<TestComponent />)
      
      expect(screen.getByTestId('time-left')).toHaveTextContent('1200')
      expect(screen.getByTestId('mode')).toHaveTextContent('shortBreak')
      expect(screen.getByTestId('sessions')).toHaveTextContent('2')
    })
  })

  describe('Sincronização com Firestore', () => {
    it('deve se inscrever nas atualizações do Firestore ao montar', () => {
      renderWithProvider(<TestComponent />)
      expect(mockCollection).toHaveBeenCalled()
      expect(mockOnSnapshot).toHaveBeenCalled()
    })

    it('deve salvar sessão no Firestore ao completar', async () => {
      vi.useFakeTimers()
      renderWithProvider(<TestComponent />)
      
      // Inicia e completa uma sessão
      fireEvent.click(screen.getByText('Iniciar'))
      
      await act(async () => {
        vi.advanceTimersByTime(25 * 60 * 1000)
      })
      
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          type: 'focus',
          duration: 1500
        })
      )
      
      vi.useRealTimers()
    })

    it('deve mesclar dados do Firestore com localStorage', () => {
      // Simula dados existentes no localStorage
      localStorage.setItem('pomodoro_state', JSON.stringify({
        timeLeft: 1200,
        mode: 'focus',
        sessionsCompleted: 1
      }))

      // Simula atualização do Firestore
      const mockSession = {
        type: 'focus',
        duration: 1500,
        completedAt: new Date()
      }

      renderWithProvider(<TestComponent />)
      
      // Dispara callback do onSnapshot
      const [callback] = mockOnSnapshot.mock.calls[0]
      act(() => {
        callback({
          docs: [{
            data: () => mockSession
          }]
        })
      })

      expect(screen.getByTestId('sessions')).toHaveTextContent('2')
    })
  })

  describe('Persistência Local', () => {
    it('deve salvar alterações no localStorage', async () => {
      vi.useFakeTimers()
      renderWithProvider(<TestComponent />)
      
      fireEvent.click(screen.getByText('Iniciar'))
      
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
      
      const state = JSON.parse(localStorage.getItem('pomodoro_state'))
      expect(state.timeLeft).toBe(1499)
      expect(state.isRunning).toBe(true)
      
      vi.useRealTimers()
    })

    it('deve manter configurações após recarregar', () => {
      // Salva configurações
      localStorage.setItem('pomodoro_settings', JSON.stringify({
        focusTime: 30,
        shortBreakTime: 5,
        longBreakTime: 15,
        sessionsUntilLongBreak: 4
      }))

      renderWithProvider(<TestComponent />)
      
      const state = JSON.parse(localStorage.getItem('pomodoro_settings'))
      expect(state.focusTime).toBe(30)
    })
  })
}) 