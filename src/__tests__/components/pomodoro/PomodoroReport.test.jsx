import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PomodoroReport } from '../../../components/pomodoro/PomodoroReport'
import { usePomodoro } from '../../../hooks/usePomodoro'
import { TimeFilterProvider } from '../../../contexts/TimeFilterContext'
import { AuthProvider } from '../../../__mocks__/AuthContext'

vi.mock('../../../hooks/usePomodoro')

const mockStats = {
  totalSessions: 10,
  totalTime: 250,
  averageTime: 25,
  completionRate: 85,
  sessionsPerDay: [
    { date: '2024-02-01', count: 2 },
    { date: '2024-02-02', count: 3 },
    { date: '2024-02-03', count: 5 }
  ]
}

const renderReport = () => {
  return render(
    <AuthProvider>
      <TimeFilterProvider>
        <PomodoroReport />
      </TimeFilterProvider>
    </AuthProvider>
  )
}

describe('PomodoroReport', () => {
  beforeEach(() => {
    usePomodoro.mockReturnValue({
      stats: mockStats,
      loading: false
    })
  })

  it('deve mostrar estatísticas gerais', () => {
    renderReport()

    expect(screen.getByText('10')).toBeInTheDocument() // Total de sessões
    expect(screen.getByText('250')).toBeInTheDocument() // Tempo total
    expect(screen.getByText('25')).toBeInTheDocument() // Tempo médio
    expect(screen.getByText('85%')).toBeInTheDocument() // Taxa de conclusão
  })

  it('deve mostrar gráfico de sessões por dia', () => {
    renderReport()

    expect(screen.getByTestId('sessions-chart')).toBeInTheDocument()
  })

  it('deve mostrar mensagem de carregamento', () => {
    usePomodoro.mockReturnValue({
      stats: null,
      loading: true
    })

    renderReport()

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve mostrar mensagem quando não há dados', () => {
    usePomodoro.mockReturnValue({
      stats: { ...mockStats, totalSessions: 0 },
      loading: false
    })

    renderReport()

    expect(screen.getByText('Nenhuma sessão completada ainda')).toBeInTheDocument()
  })
}) 