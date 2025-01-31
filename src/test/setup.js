import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup()
})

// Mock do servidor para testes de API
export const server = setupServer(
  // Exemplo de mock para a API de flashcards
  http.post('/api/generate-flashcards', async ({ request }) => {
    const { content } = await request.json()
    return HttpResponse.json({
      choices: [{
        message: {
          content: JSON.stringify([
            { front: 'Pergunta 1', back: 'Resposta 1' },
            { front: 'Pergunta 2', back: 'Resposta 2' }
          ])
        }
      }]
    })
  })
)

// Inicia o servidor de mock antes dos testes
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reseta os handlers após cada teste
afterEach(() => server.resetHandlers())

// Fecha o servidor após todos os testes
afterAll(() => server.close()) 