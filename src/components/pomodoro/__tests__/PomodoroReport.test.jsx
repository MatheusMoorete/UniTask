import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PomodoroReport from '../PomodoroReport'
import { usePomodoro } from '@/hooks/usePomodoro'

// Mock do hook usePomodoro
vi.mock('@/hooks/usePomodoro')

// Mock do Recharts para evitar erros de renderização do gráfico
vi.mock('recharts', () => ({
  LineChart: vi.fn(() => null),
  Line: vi.fn(),
  XAxis: vi.fn(),
  YAxis: vi.fn(),
  CartesianGrid: vi.fn(),
  Tooltip: vi.fn(),
  ResponsiveContainer: vi.fn(({ children }) => children)
}))

describe('PomodoroReport', () => {
  const mockWeeklyData = [
    { name: 'Seg', hours: 2 },
    { name: 'Ter', hours: 3 },
    { name: 'Qua', hours: 1 }
  ]

  const mockMonthlyData = [
    { name: '01/01', hours: 4 },
    { name: '02/01', hours: 2 }
  ]

  const mockSemesterData = [
    { name: 'Jan', hours: 20 },
    { name: 'Fev', hours: 15 }
  ]

  const mockGetWeeklyChartData = vi.fn(() => mockWeeklyData)
  const mockGetMonthlyChartData = vi.fn(() => mockMonthlyData)
  const mockGetSemesterChartData = vi.fn(() => mockSemesterData)

  beforeEach(() => {
    vi.clearAllMocks()
    usePomodoro.mockReturnValue({
      getTotalFocusTime: () => 7200, // 2 horas em segundos
      getAccessDays: () => 5,
      getStreak: () => 3,
      getWeeklyChartData: mockGetWeeklyChartData,
      getMonthlyChartData: mockGetMonthlyChartData,
      getSemesterChartData: mockGetSemesterChartData,
      formatTime: (seconds) => {
        const hours = Math.floor(seconds / 3600)
        return `${hours}h`
      }
    })
  })

  it('deve renderizar os cards de estatísticas', () => {
    render(<PomodoroReport />)
    
    expect(screen.getByText('Horas Focadas')).toBeInTheDocument()
    expect(screen.getByText('2h')).toBeInTheDocument()
    
    expect(screen.getByText('Dias Acessados')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    
    expect(screen.getByText('Dias em Sequência')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('deve renderizar as abas do gráfico', () => {
    render(<PomodoroReport />)
    
    expect(screen.getByRole('tab', { name: /semana/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /mês/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /semestre/i })).toBeInTheDocument()
  })

  it('deve mudar os dados ao trocar de aba', () => {
    render(<PomodoroReport />)
    
    // Começa com dados semanais
    expect(mockGetWeeklyChartData).toHaveBeenCalled()
    
    // Muda para dados mensais
    const monthTab = screen.getByRole('tab', { name: /mês/i })
    fireEvent.click(monthTab)
    expect(mockGetMonthlyChartData).toHaveBeenCalled()
    
    // Muda para dados semestrais
    const semesterTab = screen.getByRole('tab', { name: /semestre/i })
    fireEvent.click(semesterTab)
    expect(mockGetSemesterChartData).toHaveBeenCalled()
  })

  it('deve formatar o tempo total corretamente', () => {
    // Mock para um tempo maior
    usePomodoro.mockReturnValue({
      ...usePomodoro(),
      getTotalFocusTime: () => 14400, // 4 horas em segundos
      formatTime: (seconds) => {
        const hours = Math.floor(seconds / 3600)
        return `${hours}h`
      }
    })
    
    render(<PomodoroReport />)
    expect(screen.getByText('4h')).toBeInTheDocument()
  })

  it('deve exibir descrições nos cards', () => {
    render(<PomodoroReport />)
    
    expect(screen.getByText('Tempo total de foco')).toBeInTheDocument()
    expect(screen.getByText('Total de dias de estudo')).toBeInTheDocument()
    expect(screen.getByText('Sua sequência atual')).toBeInTheDocument()
  })

  it('deve exibir o título do gráfico', () => {
    render(<PomodoroReport />)
    expect(screen.getByText('Análise de Tempo Focado')).toBeInTheDocument()
  })
}) 