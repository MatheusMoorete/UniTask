import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { WeekView } from '../WeekView'
import { addDays, startOfWeek, setHours, setMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock das funções do date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    startOfWeek: vi.fn((date) => {
      // Retorna a segunda-feira da semana correspondente
      const result = new Date(date)
      result.setDate(date.getDate() - date.getDay() + 1) // Ajusta para segunda-feira
      return result
    }),
    addDays: vi.fn((date, days) => {
      const result = new Date(date)
      result.setDate(date.getDate() + days)
      return result
    }),
    isToday: vi.fn((date) => {
      const today = new Date(2024, 0, 15)
      return date.getDate() === today.getDate()
    }),
    format: actual.format,
    setHours: actual.setHours,
    setMinutes: actual.setMinutes
  }
})

// Mock da função de capitalização do mês
vi.mock('../../../lib/date-utils', () => ({
  capitalizeMonth: vi.fn((month) => 'Janeiro')
}))

describe('WeekView', () => {
  const mockDate = new Date(2024, 0, 15) // 15 de Janeiro de 2024, uma segunda-feira
  const mockEvents = [
    {
      id: 1,
      title: 'Reunião de Projeto',
      start: setMinutes(setHours(new Date(2024, 0, 15), 10), 0), // 10:00
      end: setMinutes(setHours(new Date(2024, 0, 15), 11), 0), // 11:00
      color: '#1a73e8'
    }
  ]

  it('deve renderizar a visualização semanal corretamente', () => {
    render(<WeekView currentDate={mockDate} events={mockEvents} />)
    
    // Verifica se o cabeçalho da semana está presente
    const weekDays = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO']
    weekDays.forEach((day, index) => {
      const header = screen.getByTestId(`day-cell-${index}`)
      expect(within(header).getByText(day)).toBeInTheDocument()
    })
  })

  it('deve exibir os horários corretamente', () => {
    render(<WeekView currentDate={mockDate} events={mockEvents} />)
    
    // Verifica alguns horários chave na coluna de horários
    const timeColumn = screen.getByTestId('time-column')
    expect(within(timeColumn).getByText('00:00')).toBeInTheDocument()
    expect(within(timeColumn).getByText('12:00')).toBeInTheDocument()
    expect(within(timeColumn).getByText('23:00')).toBeInTheDocument()
  })

  it('deve renderizar eventos corretamente', () => {
    render(<WeekView currentDate={mockDate} events={mockEvents} />)
    
    // Verifica se o evento está presente
    const eventElement = screen.getByTestId('event-1')
    expect(within(eventElement).getByText('Reunião de Projeto')).toBeInTheDocument()
    expect(within(eventElement).getByText('10:00')).toBeInTheDocument()
  })

  it('deve destacar o dia atual', () => {
    const today = new Date(2024, 0, 15) // Fixando a data para teste
    render(<WeekView currentDate={today} events={[]} />)
    
    // Encontra o elemento do dia atual e verifica se tem a classe de destaque
    const todayCell = screen.getByTestId('day-cell-0') // Primeira célula (segunda-feira)
    expect(todayCell).toHaveClass('bg-blue-50')
  })

  it('deve exibir a semana correta quando a data atual muda', () => {
    const nextWeek = new Date(2024, 0, 22) // Segunda-feira da próxima semana
    render(<WeekView currentDate={nextWeek} events={[]} />)
    
    // Verifica se as datas da próxima semana são exibidas
    const cells = screen.getAllByRole('columnheader')
    
    // Verifica cada dia da semana
    const expectedDates = ['22', '23', '24', '25', '26', '27', '28']
    expectedDates.forEach((date, index) => {
      const cell = cells[index]
      const dateElement = within(cell).getByText(date)
      expect(dateElement).toBeInTheDocument()
      expect(dateElement).toHaveClass('text-xl', 'mt-1', 'font-medium')
    })
  })

  it('deve lidar com eventos sobrepostos no mesmo dia', () => {
    const overlappingEvents = [
      ...mockEvents,
      {
        id: 2,
        title: 'Reunião de Equipe',
        start: setMinutes(setHours(new Date(2024, 0, 15), 10), 30), // 10:30
        end: setMinutes(setHours(new Date(2024, 0, 15), 11), 30), // 11:30
        color: '#34a853'
      }
    ]

    render(<WeekView currentDate={mockDate} events={overlappingEvents} />)
    
    // Verifica se ambos os eventos são renderizados
    const event1 = screen.getByTestId('event-1')
    const event2 = screen.getByTestId('event-2')
    expect(within(event1).getByText('Reunião de Projeto')).toBeInTheDocument()
    expect(within(event2).getByText('Reunião de Equipe')).toBeInTheDocument()
  })

  it('deve renderizar corretamente sem eventos', () => {
    render(<WeekView currentDate={mockDate} events={[]} />)
    
    // Verifica se a estrutura básica está presente mesmo sem eventos
    const weekDays = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO']
    weekDays.forEach((day, index) => {
      const header = screen.getByTestId(`day-cell-${index}`)
      expect(within(header).getByText(day)).toBeInTheDocument()
    })
  })
}) 