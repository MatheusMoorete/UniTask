import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MonthView } from '../MonthView'
import { format, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock das funções do date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    isToday: vi.fn((date) => {
      const testDate = new Date(2024, 1, 15) // 15 de fevereiro de 2024
      return date.getDate() === testDate.getDate() && 
             date.getMonth() === testDate.getMonth() && 
             date.getFullYear() === testDate.getFullYear()
    }),
    isSameMonth: actual.isSameMonth,
    format: actual.format
  }
})

describe('MonthView', () => {
  const mockDate = new Date(2024, 1, 15) // 15 de fevereiro de 2024
  const mockDaysInMonth = [
    new Date(2024, 0, 29), // Janeiro
    new Date(2024, 0, 30),
    new Date(2024, 0, 31),
    new Date(2024, 1, 1),  // Fevereiro
    new Date(2024, 1, 2),
    new Date(2024, 1, 3),
    new Date(2024, 1, 4),
    new Date(2024, 1, 5),
    new Date(2024, 1, 6),
    new Date(2024, 1, 7),
    new Date(2024, 1, 8),
    new Date(2024, 1, 9),
    new Date(2024, 1, 10),
    new Date(2024, 1, 11),
    new Date(2024, 1, 12),
    new Date(2024, 1, 13),
    new Date(2024, 1, 14),
    new Date(2024, 1, 15), // Hoje
    new Date(2024, 1, 16),
    new Date(2024, 1, 17),
    new Date(2024, 1, 18),
    new Date(2024, 1, 19),
    new Date(2024, 1, 20),
    new Date(2024, 1, 21),
    new Date(2024, 1, 22),
    new Date(2024, 1, 23),
    new Date(2024, 1, 24),
    new Date(2024, 1, 25),
    new Date(2024, 1, 26),
    new Date(2024, 1, 27),
    new Date(2024, 1, 28),
    new Date(2024, 1, 29),
    new Date(2024, 2, 1),  // Março
    new Date(2024, 2, 2),
    new Date(2024, 2, 3)
  ]

  const mockGetEventsForDay = vi.fn((day) => {
    // Retorna eventos apenas para o dia 15
    if (day.getDate() === 15 && day.getMonth() === 1) {
      return [
        {
          id: '1',
          title: 'Reunião de Projeto',
          start: new Date(2024, 1, 15, 10, 0),
          end: new Date(2024, 1, 15, 11, 0),
          color: '#1a73e8'
        }
      ]
    }
    return []
  })

  it('deve renderizar o cabeçalho dos dias da semana', () => {
    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay} 
      />
    )
    
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
    weekDays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('deve destacar o dia atual', () => {
    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay} 
      />
    )
    
    // Encontra a célula do dia atual (15 de fevereiro)
    const todayCell = screen.getByTestId('day-2-15')
    expect(todayCell).toHaveClass('bg-blue-50')
    expect(screen.getByText('15')).toHaveClass('text-blue-600')
  })

  it('deve exibir dias de outros meses com estilo diferente', () => {
    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay} 
      />
    )
    
    // Verifica dias do mês anterior (Janeiro)
    const januaryDay = screen.getByTestId('day-1-31')
    expect(januaryDay).toHaveClass('bg-gray-50')
    expect(within(januaryDay).getByText('31')).toHaveClass('text-gray-400')

    // Verifica dias do mês seguinte (Março)
    const marchDay = screen.getByTestId('day-3-1')
    expect(marchDay).toHaveClass('bg-gray-50')
    expect(within(marchDay).getByText('1')).toHaveClass('text-gray-400')
  })

  it('deve exibir eventos do dia corretamente', () => {
    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay} 
      />
    )
    
    // Verifica se o evento está presente no dia 15
    const eventTitle = screen.getByText('Reunião de Projeto')
    expect(eventTitle).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('deve mostrar contador de eventos quando há mais de 3 eventos', () => {
    const manyEventsForDay = (day) => {
      if (day.getDate() === 15 && day.getMonth() === 1) {
        return Array.from({ length: 5 }, (_, i) => ({
          id: String(i + 1),
          title: `Evento ${i + 1}`,
          start: new Date(2024, 1, 15, 10 + i, 0),
          end: new Date(2024, 1, 15, 11 + i, 0),
          color: '#1a73e8'
        }))
      }
      return []
    }

    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={manyEventsForDay} 
      />
    )
    
    // Verifica se apenas 3 eventos são mostrados
    expect(screen.getByText('Evento 1')).toBeInTheDocument()
    expect(screen.getByText('Evento 2')).toBeInTheDocument()
    expect(screen.getByText('Evento 3')).toBeInTheDocument()
    expect(screen.queryByText('Evento 4')).not.toBeInTheDocument()
    
    // Verifica se o contador de eventos adicionais é mostrado
    expect(screen.getByText('+2 mais')).toBeInTheDocument()
  })

  it('deve exibir a contagem total de eventos do dia', () => {
    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay} 
      />
    )
    
    // Verifica se a contagem de eventos é mostrada
    expect(screen.getByText('1 eventos')).toBeInTheDocument()
  })

  it('deve chamar onEventClick quando um evento é clicado', () => {
    const onEventClick = vi.fn()
    const event = {
      id: '1',
      title: 'Reunião de Projeto',
      start: new Date(2024, 1, 15, 10, 0),
      end: new Date(2024, 1, 15, 11, 0),
      color: '#1a73e8'
    }

    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay}
        onEventClick={onEventClick}
      />
    )
    
    const eventElement = screen.getByText('Reunião de Projeto')
    eventElement.click()
    
    expect(onEventClick).toHaveBeenCalledWith(event)
  })

  it('deve chamar onShowMoreClick quando o botão +mais é clicado', () => {
    const onShowMoreClick = vi.fn()
    const manyEventsForDay = (day) => {
      if (day.getDate() === 15 && day.getMonth() === 1) {
        return Array.from({ length: 5 }, (_, i) => ({
          id: String(i + 1),
          title: `Evento ${i + 1}`,
          start: new Date(2024, 1, 15, 10 + i, 0),
          end: new Date(2024, 1, 15, 11 + i, 0),
          color: '#1a73e8'
        }))
      }
      return []
    }

    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={manyEventsForDay}
        onShowMoreClick={onShowMoreClick}
      />
    )
    
    const showMoreButton = screen.getByText('+2 mais')
    showMoreButton.click()
    
    expect(onShowMoreClick).toHaveBeenCalledWith(
      expect.any(Date),
      expect.arrayContaining([
        expect.objectContaining({ title: 'Evento 1' }),
        expect.objectContaining({ title: 'Evento 2' }),
        expect.objectContaining({ title: 'Evento 3' }),
        expect.objectContaining({ title: 'Evento 4' }),
        expect.objectContaining({ title: 'Evento 5' })
      ])
    )
  })

  it('deve chamar onAddEventClick quando um dia é clicado', () => {
    const onAddEventClick = vi.fn()
    
    render(
      <MonthView 
        currentDate={mockDate} 
        daysInMonth={mockDaysInMonth} 
        getEventsForDay={mockGetEventsForDay}
        onAddEventClick={onAddEventClick}
      />
    )
    
    const dayCell = screen.getByTestId('day-2-15')
    dayCell.click()
    
    expect(onAddEventClick).toHaveBeenCalledWith(expect.any(Date))
  })
}) 