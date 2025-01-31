import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import FlashcardStudyMode from '../FlashcardStudyMode'
import { useFlashcards } from '../../../hooks/useFlashcards'

// Mock do hook useFlashcards
vi.mock('../../../hooks/useFlashcards', () => ({
  useFlashcards: vi.fn()
}))

describe('FlashcardStudyMode', () => {
  const mockDeck = {
    id: '1',
    title: 'Teste Deck'
  }

  const mockFlashcards = [
    { id: '1', front: 'Pergunta 1', back: 'Resposta 1' },
    { id: '2', front: 'Pergunta 2', back: 'Resposta 2' }
  ]

  const mockProcessAnswer = vi.fn()
  const mockFinishSession = vi.fn()
  const mockGetDueCards = vi.fn(() => mockFlashcards)

  beforeEach(() => {
    vi.clearAllMocks()
    // Configura o mock do hook para cada teste
    useFlashcards.mockReturnValue({
      deck: mockDeck,
      flashcards: mockFlashcards,
      processAnswer: mockProcessAnswer,
      finishSession: mockFinishSession,
      isLoading: false,
      getDueCards: mockGetDueCards
    })
  })

  it('deve renderizar o título do deck e o primeiro flashcard', () => {
    render(<FlashcardStudyMode deck={mockDeck} />)
    
    expect(screen.getByText('Teste Deck')).toBeInTheDocument()
    expect(screen.getByText('Pergunta 1')).toBeInTheDocument()
    expect(screen.getByText('1 de 2')).toBeInTheDocument()
  })

  it('deve virar o card ao clicar no botão', () => {
    render(<FlashcardStudyMode deck={mockDeck} />)
    
    const flipButton = screen.getByText(/Virar card/i)
    fireEvent.click(flipButton)
    
    expect(screen.getByText('Resposta 1')).toBeInTheDocument()
  })

  it('deve atualizar o progresso ao responder um card', async () => {
    render(<FlashcardStudyMode deck={mockDeck} />)
    
    // Vira o card
    const flipButton = screen.getByText(/Virar card/i)
    fireEvent.click(flipButton)
    
    // Responde o card
    const goodButton = screen.getByText('Bom')
    await act(async () => {
      fireEvent.click(goodButton)
    })
    
    expect(mockProcessAnswer).toHaveBeenCalled()
    expect(screen.getByText('Progresso: 50%')).toBeInTheDocument()
  })

  it('deve mostrar estatísticas ao finalizar a sessão', async () => {
    render(<FlashcardStudyMode deck={mockDeck} />)
    
    // Responde todos os cards
    for (let i = 0; i < mockFlashcards.length; i++) {
      const flipButton = screen.getByText(/Virar card/i)
      fireEvent.click(flipButton)
      
      const goodButton = screen.getByText('Bom')
      await act(async () => {
        fireEvent.click(goodButton)
      })
    }
    
    expect(mockFinishSession).toHaveBeenCalled()
    expect(screen.getByText('Sessão Finalizada')).toBeInTheDocument()
  })
}) 