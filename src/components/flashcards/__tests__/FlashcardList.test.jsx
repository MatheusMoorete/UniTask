import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FlashcardList from '../FlashcardList'
import { useFlashcards } from '../../../hooks/useFlashcards'

// Mock do hook useFlashcards
vi.mock('../../../hooks/useFlashcards')

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('FlashcardList', () => {
  const mockDeckId = '1'
  const mockFlashcards = [
    {
      id: '1',
      front: 'Test Question 1',
      back: 'Test Answer 1',
      repetitionData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date()
      },
      createdAt: new Date()
    },
    {
      id: '2',
      front: 'Test Question 2',
      back: 'Test Answer 2',
      repetitionData: {
        interval: 1,
        repetitions: 1,
        easeFactor: 2.5,
        nextReview: new Date()
      },
      createdAt: new Date()
    }
  ]

  const mockDeleteFlashcards = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useFlashcards.mockReturnValue({
      flashcards: mockFlashcards,
      deleteFlashcards: mockDeleteFlashcards,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a lista de flashcards corretamente', () => {
    render(<FlashcardList />)
    
    // Verifica se os cards estão presentes
    expect(screen.getAllByText(/Frente/i)[0]).toBeInTheDocument()
    expect(screen.getByText('Test Question 1')).toBeInTheDocument()
    expect(screen.getByText('Test Answer 1')).toBeInTheDocument()
  })

  it('deve filtrar flashcards baseado na busca', async () => {
    render(<FlashcardList />)
    
    // Digita no campo de busca
    const searchInput = screen.getByPlaceholderText('Buscar cards...')
    fireEvent.change(searchInput, { target: { value: 'Question 1' } })
    
    // Verifica se apenas o card correspondente é mostrado
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Question 2')).not.toBeInTheDocument()
    })
  })

  it('deve permitir selecionar múltiplos cards', async () => {
    render(<FlashcardList />)
    
    // Seleciona o primeiro card
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    
    // Verifica se o contador de seleção foi atualizado
    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /excluir \(1\)/i })
      expect(deleteButton).toBeInTheDocument()
    })
  })

  it('deve permitir selecionar todos os cards', async () => {
    render(<FlashcardList deckId={mockDeckId} />)

    // Seleciona o checkbox "selecionar todos" (último checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[checkboxes.length - 1])

    // Verifica se o contador de seleção foi atualizado
    await waitFor(() => {
      const deleteButton = screen.getByText(/excluir \(2\)/i)
      expect(deleteButton).toBeInTheDocument()
    })
  })

  it('deve mostrar mensagem quando não houver flashcards', () => {
    useFlashcards.mockReturnValue({
      flashcards: [],
      deleteFlashcards: mockDeleteFlashcards,
    })
    
    render(<FlashcardList />)
    
    expect(screen.getByText('Nenhum flashcard criado')).toBeInTheDocument()
  })

  it('deve permitir excluir cards selecionados', async () => {
    render(<FlashcardList deckId={mockDeckId} />)

    // Seleciona o primeiro card
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0]) // Primeiro card

    // Clica no botão de excluir
    const deleteButton = screen.getByText(/excluir \(1\)/i)
    fireEvent.click(deleteButton)

    // Confirma a exclusão
    const confirmButton = screen.getByRole('button', { name: /excluir$/i })
    fireEvent.click(confirmButton)

    // Verifica se a função de deletar foi chamada com o ID correto
    await waitFor(() => {
      expect(mockDeleteFlashcards).toHaveBeenCalledWith(['1'])
    })
  })
}) 