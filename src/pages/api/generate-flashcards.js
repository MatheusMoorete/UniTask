//API para geração de flashcards com IA - OpenAI e DeepSeek (Endpoint)

import fetch from 'node-fetch'

// Configuração do timeout
const TIMEOUT = 45000 // 45 segundos

// Função para sanitizar logs
const sanitizeLogs = (obj) => {
  const sanitized = { ...obj }
  if (sanitized.headers && sanitized.headers['x-api-key']) {
    sanitized.headers['x-api-key'] = '***********'
  }
  if (sanitized.headers && sanitized.headers['Authorization']) {
    sanitized.headers['Authorization'] = '***********'
  }
  return sanitized
}

// Função para validar o body da requisição
const validateRequest = (body) => {
  if (!body || typeof body !== 'object') {
    throw new Error('Body inválido')
  }
  
  if (!body.content || typeof body.content !== 'string') {
    throw new Error('Campo content é obrigatório')
  }

  if (!body.quantity || !Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 20) {
    throw new Error('Quantidade deve ser um número inteiro entre 1 e 20')
  }
  
  return {
    content: body.content.trim(),
    quantity: body.quantity
  }
}

const cleanJsonString = (str) => {
  return str
    .replace(/```json\s*/, '')
    .replace(/```\s*$/, '')
    .replace(/^\s+|\s+$/g, '')
}

const parseFlashcards = (content) => {
  try {
    const cleanContent = cleanJsonString(content)
    const parsed = JSON.parse(cleanContent)
    const cards = Array.isArray(parsed) ? parsed : (parsed.flashcards || [])
    
    return cards.map(card => ({
      front: card.front || card.pergunta || '',
      back: card.back || card.resposta || ''
    })).filter(card => card.front && card.back)
  } catch (error) {
    console.error('Erro ao fazer parse dos flashcards:', error)
    console.error('Conteúdo recebido:', content)
    throw new Error('Falha ao processar resposta da API')
  }
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-KEY, X-PROVIDER')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('Request recebida:', {
      method: req.method,
      url: req.url,
      headers: sanitizeLogs(req.headers),
      bodyContent: req.body.content ? req.body.content.substring(0, 50) + '...' : undefined
    })

    const content = validateRequest(req.body)
    const apiKey = req.headers['x-api-key']
    const provider = req.headers['x-provider'] || 'deepseek'

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key não fornecida',
        details: 'Header X-API-KEY é obrigatório'
      })
    }

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

      return res.json({ 
        choices: [{ message: { content: JSON.stringify(flashcards) } }]
      })

    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }

  } catch (error) {
    console.error('Erro na API:', {
      message: error.message,
      stack: error.stack
    })
    
    return res.status(500).json({
      error: 'Erro ao gerar flashcards',
      details: error.message
    })
  }
}
