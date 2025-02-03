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
    startOfWeek: vi.fn((date, options) => {
      // Cria uma nova data para não modificar a original
      const result = new Date(date)
      // Pega o dia da semana (0-6, onde 0 é domingo)
      const dayOfWeek = result.getDay()
      // Ajusta para segunda-feira (considerando que segunda é o primeiro dia)
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      result.setDate(result.getDate() + diff)
      return result
    }),
    addDays: vi.fn((date, days) => {
      const result = new Date(date)
      result.setDate(date.getDate() + days)
      return result
    }),
    isToday: vi.fn((date) => {
      // Compara com a data fixa do teste (15 de fevereiro de 2024)
      const testDate = new Date(2024, 1, 15)
      return date.getDate() === testDate.getDate() && 
             date.getMonth() === testDate.getMonth() && 
             date.getFullYear() === testDate.getFullYear()
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
    const currentDate = new Date(2024, 1, 15) // 15 de fevereiro de 2024
    render(<WeekView currentDate={currentDate} events={[]} />)
    
    // Verifica alguns horários chave na coluna de horários
    const timeColumn = screen.getByTestId('time-column')
    expect(within(timeColumn).getByText('05:00')).toBeInTheDocument()
    expect(within(timeColumn).getByText('12:00')).toBeInTheDocument()
    expect(within(timeColumn).getByText('23:00')).toBeInTheDocument()
  })

  it('deve exibir eventos corretamente', () => {
    const currentDate = new Date(2024, 1, 15) // 15 de fevereiro de 2024
    const events = [
      {
        id: '1',
        title: 'Reunião de Projeto',
        start: new Date(2024, 1, 15, 10, 0), // 10:00
        end: new Date(2024, 1, 15, 11, 0),   // 11:00
        color: '#1a73e8'
      }
    ]

    render(<WeekView currentDate={currentDate} events={events} />)

    // Verifica se o evento está presente
    const eventElement = screen.getByTestId('event-1')
    expect(within(eventElement).getByText('Reunião de Projeto')).toBeInTheDocument()
    expect(within(eventElement).getByText('10:00')).toBeInTheDocument()
  })

  it('deve destacar o dia atual', () => {
    const currentDate = new Date(2024, 1, 15) // 15 de fevereiro de 2024 (quinta-feira)
    render(<WeekView currentDate={currentDate} events={[]} />)
    
    // Encontra o elemento do dia atual e verifica se tem a classe de destaque
    const todayCell = screen.getByTestId('day-cell-3') // quinta-feira é o quarto dia (índice 3)
    expect(todayCell).toHaveClass('bg-blue-50')

    // Verifica se o texto do dia está correto
    const dayNumber = within(todayCell).getByText('15')
    expect(dayNumber).toHaveClass('text-xl', 'mt-1', 'font-medium', 'text-blue-600')
  })

  it('deve exibir a semana correta quando a data atual muda', () => {
    const currentDate = new Date(2024, 1, 19) // 19 de fevereiro de 2024 (segunda-feira)
    render(<WeekView currentDate={currentDate} events={[]} />)
    
    // Verifica se as datas da semana são exibidas
    const cells = screen.getAllByRole('columnheader')
    
    // Verifica cada dia da semana
    const expectedDates = ['19', '20', '21', '22', '23', '24', '25']
    cells.forEach((cell, index) => {
      const date = expectedDates[index]
      const dateElement = within(cell).getByText(date)
      expect(dateElement).toBeInTheDocument()
      expect(dateElement).toHaveClass('text-xl', 'mt-1', 'font-medium')
    })
  })

  it('deve lidar com eventos sobrepostos no mesmo dia', () => {
    const currentDate = new Date(2024, 1, 15)
    const events = [
      {
        id: '1',
        title: 'Reunião de Projeto',
        start: new Date(2024, 1, 15, 10, 0),
        end: new Date(2024, 1, 15, 11, 0),
        color: '#1a73e8'
      },
      {
        id: '2',
        title: 'Almoço com Cliente',
        start: new Date(2024, 1, 15, 10, 30),
        end: new Date(2024, 1, 15, 11, 30),
        color: '#34a853'
      }
    ]

    render(<WeekView currentDate={currentDate} events={events} />)
    
    // Verifica se ambos os eventos são renderizados
    const event1 = screen.getByTestId('event-1')
    const event2 = screen.getByTestId('event-2')
    expect(within(event1).getByText('Reunião de Projeto')).toBeInTheDocument()
    expect(within(event2).getByText('Almoço com Cliente')).toBeInTheDocument()
  })

  it('deve renderizar corretamente sem eventos', () => {
    const currentDate = new Date(2024, 1, 15)
    render(<WeekView currentDate={currentDate} events={[]} />)
    
    // Verifica se os dias da semana são exibidos corretamente
    const weekDays = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO']
    weekDays.forEach((day, index) => {
      const header = screen.getByTestId(`day-cell-${index}`)
      expect(within(header).getByText(day)).toBeInTheDocument()
    })
  })
}) 