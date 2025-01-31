import { describe, it, expect, vi } from 'vitest'
import { handleFlashcardGeneration } from './flashcardController.js'
import { generateFlashcards } from '../services/flashcardService.js'

// Mock do serviço
vi.mock('../services/flashcardService.js', () => ({
  generateFlashcards: vi.fn()
}))

describe('handleFlashcardGeneration', () => {
  let req, res

  beforeEach(() => {
    req = {
      method: 'POST',
      headers: {
        'x-api-key': 'test-key',
        'x-provider': 'deepseek'
      },
      body: {
        content: 'Test content',
        quantity: 2
      }
    }

    res = {
      setHeader: vi.fn(),
      status: vi.fn(() => res),
      json: vi.fn(),
      end: vi.fn()
    }

    vi.clearAllMocks()
  })

  it('deve retornar 200 e flashcards para uma requisição válida', async () => {
    const mockFlashcards = [
      { front: 'Q1', back: 'A1' },
      { front: 'Q2', back: 'A2' }
    ]

    generateFlashcards.mockResolvedValueOnce(mockFlashcards)

    await handleFlashcardGeneration(req, res)

    expect(res.json).toHaveBeenCalledWith({
      choices: [{ message: { content: JSON.stringify(mockFlashcards) } }]
    })
  })

  it('deve retornar 405 para método não permitido', async () => {
    req.method = 'GET'

    await handleFlashcardGeneration(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Método não permitido' })
  })

  it('deve retornar 200 para requisição OPTIONS', async () => {
    req.method = 'OPTIONS'

    await handleFlashcardGeneration(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })

  it('deve retornar 401 quando API key não é fornecida', async () => {
    delete req.headers['x-api-key']

    await handleFlashcardGeneration(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'API key não fornecida',
      details: 'Header X-API-KEY é obrigatório'
    })
  })

  it('deve retornar 500 quando o serviço falha', async () => {
    generateFlashcards.mockRejectedValueOnce(new Error('Service error'))

    await handleFlashcardGeneration(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro ao gerar flashcards',
      details: 'Service error'
    })
  })

  it('deve configurar os headers CORS corretamente', async () => {
    await handleFlashcardGeneration(req, res)

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true')
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  })

  it('deve usar o provider padrão quando não especificado', async () => {
    delete req.headers['x-provider']
    generateFlashcards.mockResolvedValueOnce([])

    await handleFlashcardGeneration(req, res)

    expect(generateFlashcards).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'deepseek'
    )
  })
}) 