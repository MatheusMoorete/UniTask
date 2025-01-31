import fetch from 'node-fetch'
import { TIMEOUT, parseFlashcards } from '../utils/flashcardUtils.js'

export const generateFlashcards = async (content, apiKey, provider = 'deepseek') => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
    console.log('Requisição abortada por timeout')
  }, TIMEOUT)

  try {
    const apiUrl = provider === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.deepseek.com/v1/chat/completions'

    console.log('Fazendo requisição para API:', {
      url: apiUrl,
      provider,
      contentLength: content.content.length
    })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: provider === 'openai' ? 'gpt-3.5-turbo' : 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `[Retorne um array JSON com ${content.quantity} flashcards no formato: [{"front": "pergunta", "back": "resposta"}]. Sem markdown ou texto adicional.]`
          },
          {
            role: 'user',
            content: `Crie ${content.quantity} flashcards sobre: ${content.content}`
          }
        ],
        temperature: 0.7,
        max_tokens: content.quantity * 100
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    const flashcards = parseFlashcards(data.choices[0].message.content)

    if (flashcards.length === 0) {
      throw new Error('Nenhum flashcard válido foi gerado')
    }

    return flashcards
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
} 