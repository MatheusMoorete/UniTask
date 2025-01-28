import fetch from 'node-fetch'

// Configuração do timeout
const TIMEOUT = 25000 // 25 segundos (para dar margem ao limite de 30s da Vercel)

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
  
  return body.content.trim()
}

const cleanJsonString = (str) => {
  // Remove blocos de código markdown e espaços extras
  return str
    .replace(/```json\s*/, '')  // Remove ```json do início
    .replace(/```\s*$/, '')     // Remove ``` do final
    .replace(/^\s+|\s+$/g, '') // Remove espaços extras no início e fim
}

const parseFlashcards = (content) => {
  try {
    // Limpa o conteúdo
    const cleanContent = cleanJsonString(content)
    
    // Tenta fazer o parse do JSON
    const parsed = JSON.parse(cleanContent)
    
    // Verifica se é um array direto ou está dentro de um objeto
    const cards = Array.isArray(parsed) ? parsed : (parsed.flashcards || [])
    
    // Mapeia para o formato correto
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

// Função para fazer parse do body raw
const parseBody = async (req) => {
  if (req.body) return req.body // Se já foi parseado

  return new Promise((resolve, reject) => {
    let data = ''
    
    req.on('data', chunk => {
      data += chunk
    })
    
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {}
        resolve(parsed)
      } catch (e) {
        reject(new Error('Falha ao parsear body'))
      }
    })
    
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  // CORS headers primeiro
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
    // Parse manual do body
    const body = await parseBody(req)
    
    // Log inicial sanitizado
    console.log('Request recebida:', {
      method: req.method,
      url: req.url,
      headers: sanitizeLogs(req.headers),
      bodyContent: body.content ? body.content.substring(0, 50) + '...' : undefined
    })

    // Valida a requisição
    const content = validateRequest(body)
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
        contentLength: content.length
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
              content: '[Retorne um array JSON com 5 flashcards no formato: [{"front": "pergunta", "back": "resposta"}]. Sem markdown ou texto adicional.]'
            },
            {
              role: 'user',
              content: `Crie 5 flashcards sobre: ${content}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
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