import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateFlashcards } from './flashcardService.js'
import fetch from 'node-fetch'

// Mock do node-fetch
vi.mock('node-fetch', () => {
  return {
    default: vi.fn()
  }
})

describe('generateFlashcards', () => {
  const mockApiKey = 'test-api-key'
  const mockContent = {
    content: 'Test content',
    quantity: 2
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reseta o timeout para evitar problemas nos testes
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve gerar flashcards com sucesso usando Deepseek', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify([
              { front: 'Test Q1', back: 'Test A1' },
              { front: 'Test Q2', back: 'Test A2' }
            ])
          }
        }]
      })
    }

    fetch.mockResolvedValueOnce(mockResponse)

    const result = await generateFlashcards(mockContent, mockApiKey, 'deepseek')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`
        }
      })
    )

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ front: 'Test Q1', back: 'Test A1' })
  })

  it('deve gerar flashcards com sucesso usando OpenAI', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify([
              { front: 'Test Q1', back: 'Test A1' }
            ])
          }
        }]
      })
    }

    fetch.mockResolvedValueOnce(mockResponse)

    const result = await generateFlashcards(mockContent, mockApiKey, 'openai')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`
        }
      })
    )

    expect(result).toHaveLength(1)
  })

  it('deve lidar com erro da API', async () => {
    const mockResponse = {
      ok: false,
      status: 400
    }

    fetch.mockResolvedValueOnce(mockResponse)

    await expect(generateFlashcards(mockContent, mockApiKey))
      .rejects
      .toThrow('API Error: 400')
  })

  it('deve lidar com timeout', async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    fetch.mockImplementationOnce(() => {
      controller.abort();
      return Promise.reject(new Error('AbortError'));
    });

    await expect(generateFlashcards(mockContent, mockApiKey))
      .rejects
      .toThrow('AbortError');
  })

  it('deve lidar com resposta inválida', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'invalid json'
          }
        }]
      })
    }

    fetch.mockResolvedValueOnce(mockResponse)

    await expect(generateFlashcards(mockContent, mockApiKey))
      .rejects
      .toThrow('Falha ao processar resposta da API')
  })

  it('deve lidar com flashcards vazios', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: '[]'
          }
        }]
      })
    }

    fetch.mockResolvedValueOnce(mockResponse)

    await expect(generateFlashcards(mockContent, mockApiKey))
      .rejects
      .toThrow('Nenhum flashcard válido foi gerado')
  })
}) 