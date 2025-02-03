import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { DayView } from '../DayView'
import { setHours, setMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock das funções do date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    isToday: vi.fn((date) => {
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

describe('DayView', () => {
  const mockDate = new Date(2024, 1, 15) // 15 de fevereiro de 2024
  const mockEvents = [
    {
      id: '1',
      title: 'Reunião de Projeto',
      start: setMinutes(setHours(new Date(2024, 1, 15), 10), 0), // 10:00
      end: setMinutes(setHours(new Date(2024, 1, 15), 11), 0), // 11:00
      color: '#1a73e8'
    }
  ]

  it('deve exibir os horários corretamente', () => {
    render(<DayView currentDate={mockDate} events={[]} />)
    
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

    render(<DayView currentDate={currentDate} events={events} />)

    // Verifica se o evento está presente
    const eventElement = screen.getByTestId('event-1')
    expect(within(eventElement).getByText('Reunião de Projeto')).toBeInTheDocument()
    expect(within(eventElement).getByText('10:00 - 11:00')).toBeInTheDocument()
  })

  it('deve lidar com eventos sobrepostos', () => {
    const overlappingEvents = [
      {
        id: '1',
        title: 'Reunião de Projeto',
        start: new Date(2024, 1, 15, 10, 0), // 10:00
        end: new Date(2024, 1, 15, 11, 0),   // 11:00
        color: '#1a73e8'
      },
      {
        id: '2',
        title: 'Almoço com Cliente',
        start: new Date(2024, 1, 15, 10, 30), // 10:30
        end: new Date(2024, 1, 15, 11, 30),   // 11:30
        color: '#34a853'
      }
    ]

    render(<DayView currentDate={mockDate} events={overlappingEvents} />)
    
    // Verifica se ambos os eventos são renderizados
    const event1 = screen.getByTestId('event-1')
    const event2 = screen.getByTestId('event-2')
    expect(within(event1).getByText('Reunião de Projeto')).toBeInTheDocument()
    expect(within(event2).getByText('Almoço com Cliente')).toBeInTheDocument()
  })

  it('deve exibir eventos com localização', () => {
    const eventWithLocation = [{
      id: '1',
      title: 'Reunião de Projeto',
      start: new Date(2024, 1, 15, 10, 0),
      end: new Date(2024, 1, 15, 11, 0),
      location: 'Sala de Reuniões',
      color: '#1a73e8'
    }]

    render(<DayView currentDate={mockDate} events={eventWithLocation} />)
    
    const eventElement = screen.getByTestId('event-1')
    expect(within(eventElement).getByText('📍 Sala de Reuniões')).toBeInTheDocument()
  })

  it('deve posicionar eventos corretamente na grade de horários', () => {
    render(<DayView currentDate={mockDate} events={mockEvents} />)
    
    const eventElement = screen.getByTestId('event-1')
    const eventStyle = window.getComputedStyle(eventElement)
    
    // O evento começa às 10:00, que é 5 horas após o início (5:00)
    // Cada hora tem 60px de altura, então a posição top deve ser 5 * 60 = 300px + 16px de espaçamento
    expect(eventElement).toHaveStyle({
      top: '316px', // (10 - 5) * 60 + 16
      height: '60px' // 1 hora = 60px
    })
  })

  it('deve renderizar corretamente sem eventos', () => {
    render(<DayView currentDate={mockDate} events={[]} />)
    
    // Verifica se a grade de horários está presente
    const timeColumn = screen.getByTestId('time-column')
    expect(timeColumn).toBeInTheDocument()
    
    // Verifica se não há eventos
    const events = screen.queryAllByTestId(/^event-/)
    expect(events).toHaveLength(0)
  })
}) 