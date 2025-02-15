import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PomodoroSettings from '../../../components/pomodoro/PomodoroSettings'
import { PomodoroProvider } from '../../../contexts/PomodoroContext'
import { AuthProvider } from '../../../__mocks__/AuthContext'

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

vi.mock('../../../contexts/PomodoroContext', () => ({
  ...vi.importActual('../../../contexts/PomodoroContext'),
  useGlobalPomodoro: () => ({
    settings: defaultSettings,
    updateSettings: vi.fn()
  })
}))

const renderSettings = () => {
  return render(
    <AuthProvider>
      <PomodoroProvider>
        <PomodoroSettings />
      </PomodoroProvider>
    </AuthProvider>
  )
}

describe('PomodoroSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Renderização Inicial', () => {
    it('deve mostrar o botão de configurações', () => {
      renderSettings()
      expect(screen.getByLabelText('Configurações')).toBeInTheDocument()
    })

    it('deve abrir o diálogo ao clicar no botão', () => {
      renderSettings()
      const settingsButton = screen.getByLabelText('Configurações')
      fireEvent.click(settingsButton)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Configurações de Tempo', () => {
    beforeEach(() => {
      renderSettings()
      const settingsButton = screen.getByLabelText('Configurações')
      fireEvent.click(settingsButton)
    })

    it('deve permitir ajustar o tempo de foco', () => {
      const input = screen.getByLabelText('Tempo de Foco (minutos)')
      fireEvent.change(input, { target: { value: '30' } })
      expect(input.value).toBe('30')
    })

    it('deve permitir ajustar o tempo de pausa curta', () => {
      const input = screen.getByLabelText('Tempo de Pausa Curta (minutos)')
      fireEvent.change(input, { target: { value: '10' } })
      expect(input.value).toBe('10')
    })

    it('deve permitir ajustar o tempo de pausa longa', () => {
      const input = screen.getByLabelText('Tempo de Pausa Longa (minutos)')
      fireEvent.change(input, { target: { value: '20' } })
      expect(input.value).toBe('20')
    })

    it('deve permitir ajustar o número de sessões até a pausa longa', () => {
      const input = screen.getByLabelText('Sessões até Pausa Longa')
      fireEvent.change(input, { target: { value: '5' } })
      expect(input.value).toBe('5')
    })
  })

  describe('Configurações de Som e Notificações', () => {
    beforeEach(() => {
      renderSettings()
      const settingsButton = screen.getByLabelText('Configurações')
      fireEvent.click(settingsButton)
    })

    it('deve permitir ativar/desativar sons', () => {
      const toggle = screen.getByRole('switch', { name: /sons/i })
      fireEvent.click(toggle)
      expect(toggle).toBeChecked()
    })

    it('deve permitir ajustar o volume', () => {
      const slider = screen.getByRole('slider', { name: /volume/i })
      fireEvent.change(slider, { target: { value: '80' } })
      expect(slider.value).toBe('80')
    })

    it('deve permitir ativar/desativar notificações', () => {
      const toggle = screen.getByRole('switch', { name: /notificações/i })
      fireEvent.click(toggle)
      expect(toggle).toBeChecked()
    })

    it('deve permitir ativar/desativar modo não perturbe', () => {
      const toggle = screen.getByRole('switch', { name: /não perturbe/i })
      fireEvent.click(toggle)
      expect(toggle).toBeChecked()
    })
  })

  describe('Validação de Entrada', () => {
    beforeEach(() => {
      renderSettings()
      const settingsButton = screen.getByLabelText('Configurações')
      fireEvent.click(settingsButton)
    })

    it('deve impedir valores negativos', () => {
      const input = screen.getByLabelText('Tempo de Foco (minutos)')
      fireEvent.change(input, { target: { value: '-5' } })
      expect(input.value).toBe('1')
    })

    it('deve impedir valores muito altos', () => {
      const input = screen.getByLabelText('Tempo de Foco (minutos)')
      fireEvent.change(input, { target: { value: '120' } })
      expect(input.value).toBe('60')
    })
  })

  describe('Persistência', () => {
    it('deve manter as configurações após fechar e reabrir', () => {
      renderSettings()

      // Abre as configurações
      const settingsButton = screen.getByLabelText('Configurações')
      fireEvent.click(settingsButton)

      // Altera algumas configurações
      const focusInput = screen.getByLabelText('Tempo de Foco (minutos)')
      fireEvent.change(focusInput, { target: { value: '30' } })

      // Fecha o diálogo
      const closeButton = screen.getByRole('button', { name: /fechar/i })
      fireEvent.click(closeButton)

      // Reabre o diálogo
      fireEvent.click(settingsButton)

      // Verifica se as configurações foram mantidas
      expect(screen.getByLabelText('Tempo de Foco (minutos)').value).toBe('30')
    })
  })
}) 