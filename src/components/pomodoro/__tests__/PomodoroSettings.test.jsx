import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PomodoroSettings } from '../PomodoroSettings'
import { useGlobalPomodoro } from '@/contexts/PomodoroContext'

// Mock do contexto
vi.mock('@/contexts/PomodoroContext')

// Mock do ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true
}

describe('PomodoroSettings', () => {
  const mockUpdateSettings = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useGlobalPomodoro.mockReturnValue({
      settings: defaultSettings,
      updateSettings: mockUpdateSettings
    })
  })

  it('deve renderizar o botão de configurações', () => {
    render(<PomodoroSettings />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('deve abrir o diálogo ao clicar no botão', async () => {
    render(<PomodoroSettings />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Configurações do Timer')).toBeInTheDocument()
    })
  })

  it('deve mostrar os valores atuais das configurações', async () => {
    render(<PomodoroSettings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByLabelText('Tempo de Foco (minutos)')).toHaveValue(25)
      expect(screen.getByLabelText('Pausa Curta (minutos)')).toHaveValue(5)
      expect(screen.getByLabelText('Pausa Longa (minutos)')).toHaveValue(15)
      expect(screen.getByLabelText('Sessões até Pausa Longa')).toHaveValue(4)
    })
  })

  it('deve atualizar os valores ao editar os inputs', async () => {
    render(<PomodoroSettings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      const focusInput = screen.getByLabelText('Tempo de Foco (minutos)')
      fireEvent.change(focusInput, { target: { value: '30' } })
      expect(focusInput).toHaveValue(30)
    })
  })

  it('deve salvar as configurações ao submeter o formulário', async () => {
    render(<PomodoroSettings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(async () => {
      const focusInput = screen.getByLabelText('Tempo de Foco (minutos)')
      fireEvent.change(focusInput, { target: { value: '30' } })
      
      const form = screen.getByTestId('settings-form')
      fireEvent.submit(form)
      
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        ...defaultSettings,
        focusTime: 30
      })
    })
  })

  it('deve alternar o som de notificação', async () => {
    render(<PomodoroSettings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      const soundSwitch = screen.getByRole('switch')
      expect(soundSwitch).toBeChecked()
      
      fireEvent.click(soundSwitch)
      expect(soundSwitch).not.toBeChecked()
    })
  })

  it('deve validar os valores mínimos e máximos', async () => {
    render(<PomodoroSettings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      const focusInput = screen.getByLabelText('Tempo de Foco (minutos)')
      
      // Testa valor mínimo
      fireEvent.change(focusInput, { target: { value: '0' } })
      expect(focusInput).toHaveAttribute('min', '1')
      
      // Testa valor máximo
      fireEvent.change(focusInput, { target: { value: '61' } })
      expect(focusInput).toHaveAttribute('max', '60')
    })
  })

  it('não deve renderizar nada se settings for null', () => {
    useGlobalPomodoro.mockReturnValue({
      settings: null,
      updateSettings: mockUpdateSettings
    })
    
    const { container } = render(<PomodoroSettings />)
    expect(container).toBeEmptyDOMElement()
  })
}) 