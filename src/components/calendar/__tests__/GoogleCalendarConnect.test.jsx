import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GoogleCalendarConnect from '../GoogleCalendarConnect'
import { 
  initializeGoogleCalendar, 
  authenticateAndGetEvents, 
  checkSession 
} from '../../../lib/googleCalendar'

// Mock das funções do Google Calendar
vi.mock('../../../lib/googleCalendar', () => ({
  initializeGoogleCalendar: vi.fn().mockResolvedValue(undefined),
  authenticateAndGetEvents: vi.fn(),
  checkSession: vi.fn()
}))

describe('GoogleCalendarConnect', () => {
  const mockEvents = [{ id: 1, summary: 'Evento Teste' }]
  const mockCalendars = [{ id: 'calendar1', summary: 'Calendário Teste' }]
  const mockEmail = 'teste@gmail.com'

  // Mock do GAPI
  global.gapi = {
    client: {
      oauth2: {
        userinfo: {
          get: vi.fn().mockResolvedValue({ result: { email: mockEmail } })
        }
      },
      getToken: vi.fn().mockReturnValue({ access_token: 'mock-token' }),
      setToken: vi.fn()
    }
  }

  // Mock do Google Accounts
  global.google = {
    accounts: {
      oauth2: {
        revoke: vi.fn()
      }
    }
  }

  const mockOnConnect = vi.fn()
  const mockOnDisconnect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Reset dos mocks das funções do Google Calendar
    initializeGoogleCalendar.mockResolvedValue(undefined)
    authenticateAndGetEvents.mockResolvedValue({ events: mockEvents, calendars: mockCalendars })
    checkSession.mockResolvedValue(false) // Começa desconectado
  })

  it('deve renderizar o botão de conectar inicialmente', async () => {
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /conectar com google calendar/i })).toBeInTheDocument()
    })
  })

  it('deve inicializar o Google Calendar ao montar', async () => {
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      expect(initializeGoogleCalendar).toHaveBeenCalled()
    })
  })

  it('deve verificar a sessão existente ao montar', async () => {
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      expect(checkSession).toHaveBeenCalled()
    })
  })

  it('deve conectar e obter eventos ao clicar no botão', async () => {
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /conectar com google calendar/i })
      fireEvent.click(button)
    })
    
    await waitFor(() => {
      expect(authenticateAndGetEvents).toHaveBeenCalled()
      expect(mockOnConnect).toHaveBeenCalledWith(mockEvents, mockCalendars)
      expect(screen.getByText(`Conectado como ${mockEmail}`)).toBeInTheDocument()
    })
  })

  it('deve mostrar estado de carregamento durante a conexão', async () => {
    authenticateAndGetEvents.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /conectar com google calendar/i })
      fireEvent.click(button)
    })
    
    expect(screen.getByRole('button', { name: /conectando/i })).toBeInTheDocument()
  })

  it('deve desconectar ao clicar no botão de logout', async () => {
    // Simula usuário já conectado
    checkSession.mockResolvedValue(true)
    authenticateAndGetEvents.mockResolvedValueOnce({ events: mockEvents, calendars: mockCalendars })
    
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      expect(screen.getByText(`Conectado como ${mockEmail}`)).toBeInTheDocument()
    })
    
    const logoutButton = screen.getByRole('button', { name: '' })
    await userEvent.click(logoutButton)
    
    expect(mockOnDisconnect).toHaveBeenCalled()
    expect(global.gapi.client.setToken).toHaveBeenCalledWith('')
    expect(global.google.accounts.oauth2.revoke).toHaveBeenCalledWith('mock-token')
  })

  it('deve lidar com erro na inicialização', async () => {
    const consoleError = vi.spyOn(console, 'error')
    initializeGoogleCalendar.mockRejectedValue(new Error('Erro de inicialização'))
    
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Erro ao inicializar Google Calendar:',
        expect.any(Error)
      )
      expect(mockOnDisconnect).toHaveBeenCalled()
    })
  })

  it('deve lidar com erro na conexão', async () => {
    const consoleError = vi.spyOn(console, 'error')
    authenticateAndGetEvents.mockRejectedValue(new Error('Erro de conexão'))
    
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /conectar com google calendar/i })
      fireEvent.click(button)
    })
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Erro ao conectar com Google Calendar:',
        expect.any(Error)
      )
      expect(mockOnDisconnect).toHaveBeenCalled()
    })
  })

  it('deve limpar o localStorage ao desconectar', async () => {
    // Simula usuário já conectado
    checkSession.mockResolvedValue(true)
    authenticateAndGetEvents.mockResolvedValueOnce({ events: mockEvents, calendars: mockCalendars })
    
    render(<GoogleCalendarConnect onConnect={mockOnConnect} onDisconnect={mockOnDisconnect} />)
    
    await waitFor(() => {
      expect(screen.getByText(`Conectado como ${mockEmail}`)).toBeInTheDocument()
    })
    
    const logoutButton = screen.getByRole('button', { name: '' })
    await userEvent.click(logoutButton)
    
    expect(localStorage.getItem('googleCalendarToken')).toBeNull()
  })
}) 