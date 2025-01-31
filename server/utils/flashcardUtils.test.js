import { describe, it, expect } from 'vitest'
import { validateRequest, cleanJsonString, parseFlashcards, sanitizeLogs } from './flashcardUtils.js'

describe('validateRequest', () => {
  it('deve validar uma requisição válida', () => {
    const validRequest = {
      content: 'Teste de conteúdo',
      quantity: 5
    }
    
    expect(() => validateRequest(validRequest)).not.toThrow()
    expect(validateRequest(validRequest)).toEqual({
      content: 'Teste de conteúdo',
      quantity: 5
    })
  })

  it('deve rejeitar uma requisição sem content', () => {
    const invalidRequest = {
      quantity: 5
    }
    
    expect(() => validateRequest(invalidRequest)).toThrow('Campo content é obrigatório')
  })

  it('deve rejeitar uma requisição com quantity inválida', () => {
    const invalidRequest = {
      content: 'Teste',
      quantity: 0
    }
    
    expect(() => validateRequest(invalidRequest)).toThrow('Quantidade deve ser um número inteiro entre 1 e 20')
  })

  it('deve rejeitar uma requisição sem body', () => {
    expect(() => validateRequest(null)).toThrow('Body inválido')
  })
})

describe('cleanJsonString', () => {
  it('deve limpar marcações de código JSON', () => {
    const input = '```json\n{"test": "value"}\n```'
    expect(cleanJsonString(input)).toBe('{"test": "value"}')
  })

  it('deve remover espaços em branco extras', () => {
    const input = '  {"test": "value"}  '
    expect(cleanJsonString(input)).toBe('{"test": "value"}')
  })
})

describe('parseFlashcards', () => {
  it('deve parsear flashcards válidos', () => {
    const input = JSON.stringify([
      { front: 'Pergunta 1', back: 'Resposta 1' },
      { front: 'Pergunta 2', back: 'Resposta 2' }
    ])
    
    const result = parseFlashcards(input)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ front: 'Pergunta 1', back: 'Resposta 1' })
  })

  it('deve aceitar formato alternativo com pergunta/resposta', () => {
    const input = JSON.stringify([
      { pergunta: 'Pergunta 1', resposta: 'Resposta 1' }
    ])
    
    const result = parseFlashcards(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ front: 'Pergunta 1', back: 'Resposta 1' })
  })

  it('deve filtrar flashcards inválidos', () => {
    const input = JSON.stringify([
      { front: 'Pergunta 1', back: 'Resposta 1' },
      { front: '', back: '' },
      { invalid: 'card' }
    ])
    
    const result = parseFlashcards(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ front: 'Pergunta 1', back: 'Resposta 1' })
  })

  it('deve lançar erro para JSON inválido', () => {
    expect(() => parseFlashcards('invalid json')).toThrow('Falha ao processar resposta da API')
  })
})

describe('sanitizeLogs', () => {
  it('deve ocultar chaves sensíveis', () => {
    const input = {
      headers: {
        'x-api-key': 'secret-key',
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      }
    }
    
    const result = sanitizeLogs(input)
    expect(result.headers['x-api-key']).toBe('***********')
    expect(result.headers['Authorization']).toBe('***********')
    expect(result.headers['Content-Type']).toBe('application/json')
  })

  it('deve manter outros campos inalterados', () => {
    const input = {
      method: 'POST',
      url: '/api/test',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    const result = sanitizeLogs(input)
    expect(result).toEqual(input)
  })
}) 