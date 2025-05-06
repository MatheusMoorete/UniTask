import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AICardGenerator from '../AICardGenerator'
import { useFlashcards } from '../../../hooks/useFlashcards'
import { useApiKey } from '../../../hooks/useApiKey'
import { generateFlashcards } from '../../../services/flashcardService'
import { showToast } from '../../../lib/toast'

// Mocks dos hooks e serviços
vi.mock('../../../hooks/useFlashcards', () => ({
  useFlashcards: vi.fn()
}))

vi.mock('../../../hooks/useApiKey', () => ({
  useApiKey: vi.fn()
}))

vi.mock('../../../services/flashcardService', () => ({
  generateFlashcards: vi.fn()
}))

// Mock do toast
vi.mock('../../../lib/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('AICardGenerator', () => {
  const mockDeckId = '1'
  const mockApiKey = 'test-api-key'
  const mockContent = 'Test content for flashcard generation'
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock do hook useFlashcards
    useFlashcards.mockReturnValue({
      createFlashcard: vi.fn()
    })
    
    // Mock do hook useApiKey
    useApiKey.mockReturnValue({
      apiKeys: { deepseek: mockApiKey },
      isLoading: false,
      saveApiKey: vi.fn()
    })

    showToast.error.mockClear()
    showToast.success.mockClear()
  })

  it('deve renderizar o formulário de geração corretamente', () => {
    render(
      <AICardGenerator
        open={true}
        onOpenChange={vi.fn()}
        deckId={mockDeckId}
      />
    )
    
    // Verifica se os elementos principais estão presentes
    expect(screen.getByText('Gerar Flashcards com IA')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gerar flashcards/i })).toBeInTheDocument()
  })

  it('deve mostrar formulário de API key quando não configurada', () => {
    useApiKey.mockReturnValue({
      apiKeys: {},
      isLoading: false,
      saveApiKey: vi.fn()
    })

    render(
      <AICardGenerator
        open={true}
        onOpenChange={vi.fn()}
        deckId={mockDeckId}
      />
    )
    
    // Verifica se o formulário de API key está visível
    expect(screen.getByText(/chave api do/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Insira sua chave API')).toBeInTheDocument()
  })

  it('deve salvar a API key corretamente', async () => {
    const mockSaveApiKey = vi.fn()
    useApiKey.mockReturnValue({
      apiKeys: {},
      isLoading: false,
      saveApiKey: mockSaveApiKey
    })

    render(
      <AICardGenerator
        open={true}
        onOpenChange={vi.fn()}
        deckId={mockDeckId}
      />
    )
    
    // Preenche e salva a API key
    const input = screen.getByPlaceholderText('Insira sua chave API')
    fireEvent.change(input, { target: { value: mockApiKey } })
    
    const saveButton = screen.getByRole('button', { name: /salvar chave api/i })
    fireEvent.click(saveButton)
    
    // Verifica se a função foi chamada corretamente
    await waitFor(() => {
      expect(mockSaveApiKey).toHaveBeenCalledWith('deepseek', mockApiKey)
    })
  })

  it('deve gerar flashcards com sucesso', async () => {
    const mockGeneratedCards = [
      { front: 'Q1', back: 'A1' },
      { front: 'Q2', back: 'A2' }
    ]
    
    generateFlashcards.mockResolvedValueOnce(mockGeneratedCards)
    const mockCreateFlashcard = vi.fn()
    useFlashcards.mockReturnValue({
      createFlashcard: mockCreateFlashcard
    })

    render(
      <AICardGenerator
        open={true}
        onOpenChange={vi.fn()}
        deckId={mockDeckId}
      />
    )
    
    // Preenche o conteúdo
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: mockContent } })
    
    // Clica no botão de gerar
    const generateButton = screen.getByRole('button', { name: /gerar flashcards/i })
    fireEvent.click(generateButton)
    
    // Verifica se as funções foram chamadas corretamente
    await waitFor(() => {
      expect(generateFlashcards).toHaveBeenCalledWith(
        mockContent.trim(),
        10,
        mockApiKey,
        'deepseek'
      )
      expect(mockCreateFlashcard).toHaveBeenCalledTimes(2)
    })
  })

  it('deve mostrar erro quando a geração falha', async () => {
    generateFlashcards.mockRejectedValueOnce(new Error('API Error'))

    render(
      <AICardGenerator
        open={true}
        onOpenChange={vi.fn()}
        deckId={mockDeckId}
      />
    )
    
    // Preenche o conteúdo
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: mockContent } })
    
    // Clica no botão de gerar
    const generateButton = screen.getByRole('button', { name: /gerar flashcards/i })
    fireEvent.click(generateButton)
    
    // Verifica se o toast de erro foi chamado
    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalledWith('Erro ao gerar flashcards')
    })
  })

  it('deve permitir trocar entre provedores de IA', async () => {
    useApiKey.mockReturnValue({
      apiKeys: { deepseek: 'key1', openai: 'key2' },
      isLoading: false,
      saveApiKey: vi.fn()
    })

    render(
      <AICardGenerator
        open={true}
        onOpenChange={vi.fn()}
        deckId={mockDeckId}
      />
    )
    
    // Seleciona OpenAI
    const providerSelect = screen.getByRole('combobox')
    fireEvent.change(providerSelect, { target: { value: 'openai' } })
    
    // Verifica se a mudança foi aplicada
    await waitFor(() => {
      expect(providerSelect.value).toBe('openai')
    })
  })
}) 