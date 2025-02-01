import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NextDeadlines } from '../NextDeadlines'
import { useGoogleCalendar } from '../../../contexts/GoogleCalendarContext'
import * as router from 'react-router-dom'
import { addDays, startOfDay } from 'date-fns'

// Mock dos hooks
vi.mock('react-router-dom')
vi.mock('../../../contexts/GoogleCalendarContext')

describe('NextDeadlines', () => {
  const mockNavigate = vi.fn()
  const today = startOfDay(new Date())

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(router, 'useNavigate').mockImplementation(() => mockNavigate)
  })

  it('deve mostrar mensagem quando não está autenticado', () => {
    useGoogleCalendar.mockReturnValue({
      isAuthenticated: false,
      events: [],
      dashboardCalendars: []
    })

    render(<NextDeadlines />)
    expect(screen.getByText(/Conecte seu Google Calendar/)).toBeInTheDocument()
  })

  it('deve mostrar mensagem quando não há eventos próximos', () => {
    useGoogleCalendar.mockReturnValue({
      isAuthenticated: true,
      events: [],
      dashboardCalendars: []
    })

    render(<NextDeadlines />)
    expect(screen.getByText(/Nenhum prazo para os próximos 7 dias/)).toBeInTheDocument()
  })

  it('deve mostrar eventos dos próximos 7 dias', () => {
    const mockEvents = [
      {
        id: '1',
        summary: 'Prova de Matemática',
        start: { dateTime: addDays(today, 2).toISOString() },
        calendarId: 'calendar1',
        calendarColor: '#4285f4'
      },
      {
        id: '2',
        summary: 'Entrega do Trabalho',
        start: { dateTime: addDays(today, 4).toISOString() },
        calendarId: 'calendar1',
        calendarColor: '#34a853'
      }
    ]

    useGoogleCalendar.mockReturnValue({
      isAuthenticated: true,
      events: mockEvents,
      dashboardCalendars: ['calendar1']
    })

    render(<NextDeadlines />)

    expect(screen.getByText('Prova de Matemática')).toBeInTheDocument()
    expect(screen.getByText('Entrega do Trabalho')).toBeInTheDocument()
  })

  it('deve filtrar eventos por calendários visíveis', () => {
    const mockEvents = [
      {
        id: '1',
        summary: 'Evento Visível',
        start: { dateTime: addDays(today, 2).toISOString() },
        calendarId: 'calendar1',
        calendarColor: '#4285f4'
      },
      {
        id: '2',
        summary: 'Evento Oculto',
        start: { dateTime: addDays(today, 3).toISOString() },
        calendarId: 'calendar2',
        calendarColor: '#34a853'
      }
    ]

    useGoogleCalendar.mockReturnValue({
      isAuthenticated: true,
      events: mockEvents,
      dashboardCalendars: ['calendar1']
    })

    render(<NextDeadlines />)

    expect(screen.getByText('Evento Visível')).toBeInTheDocument()
    expect(screen.queryByText('Evento Oculto')).not.toBeInTheDocument()
  })

  it('deve navegar para a página do calendário ao clicar', () => {
    useGoogleCalendar.mockReturnValue({
      isAuthenticated: true,
      events: [],
      dashboardCalendars: []
    })

    render(<NextDeadlines />)

    const card = screen.getByText('Próximos Prazos').closest('div.rounded-lg')
    fireEvent.click(card)

    expect(mockNavigate).toHaveBeenCalledWith('/calendar')
  })

  it('deve limitar a exibição a 5 eventos', () => {
    const mockEvents = Array(7).fill(null).map((_, i) => ({
      id: String(i),
      summary: `Evento ${i}`,
      start: { dateTime: addDays(today, i + 1).toISOString() },
      calendarId: 'calendar1',
      calendarColor: '#4285f4'
    }))

    useGoogleCalendar.mockReturnValue({
      isAuthenticated: true,
      events: mockEvents,
      dashboardCalendars: ['calendar1']
    })

    render(<NextDeadlines />)

    // Deve mostrar apenas os primeiros 5 eventos
    expect(screen.getByText('Evento 0')).toBeInTheDocument()
    expect(screen.getByText('Evento 4')).toBeInTheDocument()
    expect(screen.queryByText('Evento 5')).not.toBeInTheDocument()
  })
}) 