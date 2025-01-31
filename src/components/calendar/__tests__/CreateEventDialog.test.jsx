import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateEventDialog } from '../CreateEventDialog'
import { useGoogleCalendar } from '../../../contexts/GoogleCalendarContext'

// Mock do hook useGoogleCalendar
vi.mock('../../../contexts/GoogleCalendarContext')

// Mock do scrollIntoView para o Radix UI
Element.prototype.scrollIntoView = vi.fn()

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Configuração do jsdom para eventos de ponteiro
class MockPointerEvent extends Event {
  constructor(type, props = {}) {
    super(type, { bubbles: true, cancelable: true, composed: true, ...props })
    
    // Definir propriedades usando Object.defineProperty
    const properties = {
      pointerId: props.pointerId ?? 1,
      pointerType: props.pointerType ?? 'mouse',
      clientX: props.clientX ?? 0,
      clientY: props.clientY ?? 0,
      target: props.target ?? null,
      currentTarget: props.currentTarget ?? null,
      relatedTarget: props.relatedTarget ?? null,
      screenX: props.screenX ?? 0,
      screenY: props.screenY ?? 0,
      pageX: props.pageX ?? 0,
      pageY: props.pageY ?? 0,
      movementX: props.movementX ?? 0,
      movementY: props.movementY ?? 0,
      buttons: props.buttons ?? 0,
      pressure: props.pressure ?? 0,
      tangentialPressure: props.tangentialPressure ?? 0,
      tiltX: props.tiltX ?? 0,
      tiltY: props.tiltY ?? 0,
      twist: props.twist ?? 0,
      width: props.width ?? 1,
      height: props.height ?? 1
    }

    Object.entries(properties).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        value,
        writable: false,
        configurable: true,
        enumerable: true
      })
    })
  }
}

// Estender o Element.prototype para adicionar os métodos de pointer capture
Object.defineProperties(Element.prototype, {
  hasPointerCapture: {
    value: function() { return false },
    configurable: true
  },
  setPointerCapture: {
    value: function() {},
    configurable: true
  },
  releasePointerCapture: {
    value: function() {},
    configurable: true
  }
})

// Substituir o PointerEvent global
global.PointerEvent = MockPointerEvent

// Configuração do getComputedStyle para o Radix UI
Object.defineProperty(window, 'getComputedStyle', {
  value: (element) => ({
    getPropertyValue: (prop) => {
      if (prop === 'pointer-events') return 'auto'
      return element.style?.[prop] || ''
    }
  })
})

// Configuração do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('CreateEventDialog', () => {
  const mockCalendars = [
    { id: '1', summary: 'Calendário 1' },
    { id: '2', summary: 'Calendário 2' }
  ]

  const mockCreateEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEvent,
      isLoading: false,
      error: null
    })
  })

  it('deve renderizar o botão de criar evento', async () => {
    render(<CreateEventDialog />)
    const button = await screen.findByRole('button', { name: /criar evento/i })
    expect(button).toBeInTheDocument()
  })

  it('deve abrir o diálogo ao clicar no botão', async () => {
    render(<CreateEventDialog />)
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await userEvent.click(button)
    
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /novo evento/i })).toBeInTheDocument()
  })

  it('deve listar os calendários disponíveis', async () => {
    const user = userEvent.setup()
    render(<CreateEventDialog />)
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await user.click(button)
    
    const combobox = await screen.findByRole('combobox')
    await user.click(combobox)
    
    // Aguarda o Radix UI renderizar o conteúdo do select
    await waitFor(async () => {
      const options = await screen.findAllByRole('option')
      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent('Calendário 1')
      expect(options[1]).toHaveTextContent('Calendário 2')
    })
  })

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<CreateEventDialog />)
    
    // Abre o diálogo
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await user.click(button)
    
    // Tenta submeter sem preencher os campos
    const form = await screen.findByRole('form')
    fireEvent.submit(form)
    
    // Aguarda a mensagem de erro aparecer
    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Título é obrigatório')
    }, { timeout: 3000 })
  })

  // TODO: Revisar este teste - formato das datas e timezone
  it.skip('deve preencher e submeter o formulário corretamente', async () => {
    const mockCreateEventSuccess = vi.fn().mockResolvedValue({ id: '123' })
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventSuccess,
      isLoading: false,
      error: null
    })

    const user = userEvent.setup()
    render(<CreateEventDialog />)
    
    // Abre o diálogo
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await user.click(button)
    
    // Preenche o título
    const titleInput = await screen.findByLabelText(/título/i)
    await user.type(titleInput, 'Reunião de Teste')
    
    // Seleciona o calendário
    const combobox = await screen.findByRole('combobox')
    await user.click(combobox)
    
    const option = await screen.findByRole('option', { name: 'Calendário 1' })
    await user.click(option)

    // Preenche a data de início
    const startInput = await screen.findByLabelText(/início/i)
    await user.type(startInput, '2024-02-01T10:00')

    // Preenche a data de fim
    const endInput = await screen.findByLabelText(/fim/i)
    await user.type(endInput, '2024-02-01T11:00')
    
    // Submete o formulário
    const form = await screen.findByRole('form')
    fireEvent.submit(form)
    
    // Aguarda a chamada do createEvent com o novo formato
    await waitFor(() => {
      expect(mockCreateEventSuccess).toHaveBeenCalledWith({
        summary: 'Reunião de Teste',
        description: '',
        location: '',
        start: {
          dateTime: expect.any(String),
          timeZone: expect.any(String)
        },
        end: {
          dateTime: expect.any(String),
          timeZone: expect.any(String)
        }
      }, '1')
    }, { timeout: 3000 })
  })

  it('deve mostrar estado de carregamento durante a submissão', async () => {
    const mockCreateEventLoading = vi.fn(() => new Promise(() => {})) // Promise que nunca resolve
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventLoading,
      isLoading: true,
      error: null
    })

    const user = userEvent.setup()
    render(<CreateEventDialog />)
    
    // Abre o diálogo
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await user.click(button)
    
    // Aguarda o botão de submit aparecer e verifica seu estado
    const submitButton = await screen.findByRole('button', { name: /carregando/i })
    expect(submitButton).toBeDisabled()
  })

  it('deve mostrar mensagem de erro quando a criação falha', async () => {
    const errorMessage = 'Erro ao criar evento'
    const mockCreateEventWithError = vi.fn().mockRejectedValue(new Error(errorMessage))
    
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventWithError,
      isLoading: false,
      error: { message: errorMessage }
    })

    const user = userEvent.setup()
    render(<CreateEventDialog />)
    
    // Abre o diálogo
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await user.click(button)
    
    // Preenche o título
    const titleInput = await screen.findByLabelText(/título/i)
    await user.type(titleInput, 'Teste')
    
    // Seleciona o calendário
    const combobox = await screen.findByRole('combobox')
    await user.click(combobox)
    
    const option = await screen.findByRole('option', { name: 'Calendário 1' })
    await user.click(option)
    
    // Submete o formulário
    const form = await screen.findByRole('form')
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    
    // Aguarda a mensagem de erro aparecer
    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent(errorMessage)
    }, { timeout: 3000 })
  })

  // TODO: Revisar este teste - verificação do estado do formulário
  it.skip('deve limpar o formulário após criação bem-sucedida', async () => {
    const mockCreateEventFn = vi.fn().mockResolvedValue({ id: '123' })
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventFn,
      isLoading: false,
      error: null
    })

    const user = userEvent.setup()
    render(<CreateEventDialog />)
    
    // Abre o diálogo
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await user.click(button)
    
    // Preenche o título
    const titleInput = await screen.findByLabelText(/título/i)
    await user.type(titleInput, 'Reunião de Teste')
    
    // Seleciona o calendário
    const combobox = await screen.findByRole('combobox')
    await user.click(combobox)
    
    const option = await screen.findByRole('option', { name: 'Calendário 1' })
    await user.click(option)

    // Preenche a data de início
    const startInput = await screen.findByLabelText(/início/i)
    await user.type(startInput, '2024-02-01T10:00')

    // Preenche a data de fim
    const endInput = await screen.findByLabelText(/fim/i)
    await user.type(endInput, '2024-02-01T11:00')
    
    // Submete o formulário
    const form = await screen.findByRole('form')
    fireEvent.submit(form)
    
    // Espera a Promise resolver e o diálogo fechar
    await waitFor(() => {
      expect(mockCreateEventFn).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      
      // Verifica se os campos foram limpos
      const newDialog = screen.queryByRole('dialog')
      if (newDialog) {
        const titleInput = screen.queryByLabelText(/título/i)
        expect(titleInput?.value).toBe('')
      }
    }, { timeout: 3000 })
  })
}) 