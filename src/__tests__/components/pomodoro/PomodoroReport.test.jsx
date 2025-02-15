import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PomodoroReport from '../../../components/pomodoro/PomodoroReport'
import { usePomodoro } from '../../../hooks/usePomodoro'
import { TimeFilterProvider } from '../../../contexts/TimeFilterContext'
import { AuthProvider } from '../../../__mocks__/AuthContext'

vi.mock('../../../hooks/usePomodoro')

const mockData = {
  getTotalFocusTime: () => 250,
  getAccessDays: () => 10,
  getStreak: () => 5,
  getDailyAverage: () => 25,
  getProductivityTrend: () => 15,
  getDistributionData: () => [
    { name: 'Foco', value: 180 },
    { name: 'Pausa Curta', value: 30 },
    { name: 'Pausa Longa', value: 40 }
  ],
  getWeeklyChartData: () => [
    { name: 'Seg', hours: 2 },
    { name: 'Ter', hours: 3 },
    { name: 'Qua', hours: 4 }
  ],
  getMonthlyChartData: () => [],
  getSemesterChartData: () => [],
  formatTime: (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
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
    usePomodoro.mockReturnValue(mockData)
  })

  it('deve mostrar estatísticas gerais', () => {
    renderReport()
    expect(screen.getByText('4:10')).toBeInTheDocument() // 250 segundos formatados
    expect(screen.getByText('10')).toBeInTheDocument() // Dias acessados
    expect(screen.getByText('5')).toBeInTheDocument() // Streak
    expect(screen.getByText('15%')).toBeInTheDocument() // Tendência
  })

  it('deve mostrar gráfico de distribuição', () => {
    renderReport()
    expect(screen.getByText('180m')).toBeInTheDocument() // Tempo de foco
    expect(screen.getByText('30m')).toBeInTheDocument() // Pausa curta
    expect(screen.getByText('40m')).toBeInTheDocument() // Pausa longa
  })

  it('deve mostrar gráfico de tempo focado', () => {
    renderReport()
    expect(screen.getByText('Análise de Tempo Focado')).toBeInTheDocument()
  })
}) 