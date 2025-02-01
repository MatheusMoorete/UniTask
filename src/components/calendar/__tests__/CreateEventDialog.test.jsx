import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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
    await act(async () => {
      render(<CreateEventDialog />)
    })
    const button = await screen.findByRole('button', { name: /criar evento/i })
    expect(button).toBeInTheDocument()
  })

  it('deve abrir o diálogo ao clicar no botão', async () => {
    await act(async () => {
      render(<CreateEventDialog />)
    })
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await act(async () => {
      await userEvent.click(button)
    })
    
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /novo evento/i })).toBeInTheDocument()
  })

  it('deve listar os calendários disponíveis', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<CreateEventDialog />)
    })
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await act(async () => {
      await user.click(button)
    })
    
    const combobox = await screen.findByRole('combobox')
    await act(async () => {
      await user.click(combobox)
    })
    
    await waitFor(async () => {
      const options = await screen.findAllByRole('option')
      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent('Calendário 1')
      expect(options[1]).toHaveTextContent('Calendário 2')
    })
  })

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<CreateEventDialog />)
    })
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await act(async () => {
      await user.click(button)
    })
    
    const form = await screen.findByRole('form')
    await act(async () => {
      fireEvent.submit(form)
    })
    
    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Título é obrigatório')
    }, { timeout: 3000 })
  })

  it.skip('deve preencher e submeter o formulário corretamente', async () => {
    const mockCreateEventSuccess = vi.fn().mockResolvedValue({ id: '123' })
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventSuccess,
      isLoading: false,
      error: null
    })

    const user = userEvent.setup()
    await act(async () => {
      render(<CreateEventDialog />)
    })
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await act(async () => {
      await user.click(button)
    })
    
    const titleInput = await screen.findByLabelText(/título/i)
    await act(async () => {
      await user.type(titleInput, 'Reunião de Teste')
    })
    
    const combobox = await screen.findByRole('combobox')
    await act(async () => {
      await user.click(combobox)
    })
    
    const option = await screen.findByRole('option', { name: 'Calendário 1' })
    await act(async () => {
      await user.click(option)
    })

    const startInput = await screen.findByLabelText(/início/i)
    await act(async () => {
      await user.type(startInput, '2024-02-01T10:00')
    })

    const endInput = await screen.findByLabelText(/fim/i)
    await act(async () => {
      await user.type(endInput, '2024-02-01T11:00')
    })
    
    const form = await screen.findByRole('form')
    await act(async () => {
      fireEvent.submit(form)
    })
    
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
    const mockCreateEventLoading = vi.fn(() => new Promise(() => {}))
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventLoading,
      isLoading: true,
      error: null
    })

    const user = userEvent.setup()
    await act(async () => {
      render(<CreateEventDialog />)
    })
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await act(async () => {
      await user.click(button)
    })
    
    const submitButton = await screen.findByRole('button', { name: /carregando/i })
    expect(submitButton).toBeDisabled()
  })

  it.skip('deve mostrar mensagem de erro quando a criação falha', async () => {
    // Mock do erro
    const mockError = new Error('Erro ao criar evento')
    const mockCreateEventError = vi.fn().mockRejectedValue(mockError)
    console.log('Setting up test with mock error')
    
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventError,
      isLoading: false,
      error: null
    })

    const user = userEvent.setup()
    render(<CreateEventDialog />)
    console.log('Component rendered')
    
    // Abrir o diálogo e preencher dados mínimos necessários
    const createButton = screen.getByRole('button', { name: /criar evento/i })
    await user.click(createButton)
    console.log('Dialog opened')
    
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Teste')
    console.log('Title input filled')
    
    // Selecionar calendário
    const combobox = screen.getByRole('combobox')
    await user.click(combobox)
    console.log('Combobox clicked')
    
    const option = screen.getByRole('option', { name: 'Calendário 1' })
    await user.click(option)
    console.log('Calendar selected')
    
    // Submeter o formulário
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    console.log('Submit button found:', submitButton)
    await user.click(submitButton)
    console.log('Form submitted')
    
    // Aguardar e verificar mensagem de erro
    await waitFor(() => {
      console.log('Waiting for error message...')
      const errorMessage = screen.getByTestId('error-message')
      console.log('Error message found:', errorMessage)
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveTextContent('Erro ao criar evento')
    }, { 
      timeout: 3000,
      onTimeout: (error) => {
        console.log('Timeout reached. Current DOM:', document.body.innerHTML)
        return error
      }
    })
  })

  it.skip('deve limpar o formulário após criação bem-sucedida', async () => {
    const mockCreateEventFn = vi.fn().mockResolvedValue({ id: '123' })
    useGoogleCalendar.mockReturnValue({
      calendars: mockCalendars,
      createEvent: mockCreateEventFn,
      isLoading: false,
      error: null
    })

    const user = userEvent.setup()
    await act(async () => {
      render(<CreateEventDialog />)
    })
    
    const button = await screen.findByRole('button', { name: /criar evento/i })
    await act(async () => {
      await user.click(button)
    })
    
    const titleInput = await screen.findByLabelText(/título/i)
    await act(async () => {
      await user.type(titleInput, 'Reunião de Teste')
    })
    
    const combobox = await screen.findByRole('combobox')
    await act(async () => {
      await user.click(combobox)
    })
    
    const option = await screen.findByRole('option', { name: 'Calendário 1' })
    await act(async () => {
      await user.click(option)
    })

    const startInput = await screen.findByLabelText(/início/i)
    await act(async () => {
      await user.type(startInput, '2024-02-01T10:00')
    })

    const endInput = await screen.findByLabelText(/fim/i)
    await act(async () => {
      await user.type(endInput, '2024-02-01T11:00')
    })
    
    const form = await screen.findByRole('form')
    await act(async () => {
      fireEvent.submit(form)
    })
    
    await waitFor(() => {
      expect(mockCreateEventFn).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      
      const newDialog = screen.queryByRole('dialog')
      if (newDialog) {
        const titleInput = screen.queryByLabelText(/título/i)
        expect(titleInput?.value).toBe('')
      }
    }, { timeout: 3000 })
  })
}) 