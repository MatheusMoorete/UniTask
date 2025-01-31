// Configuração do timeout
export const TIMEOUT = 45000 // 45 segundos

// Função para sanitizar logs
export const sanitizeLogs = (obj) => {
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
export const validateRequest = (body) => {
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

export const cleanJsonString = (str) => {
  return str
    .replace(/```json\s*/, '')
    .replace(/```\s*$/, '')
    .replace(/^\s+|\s+$/g, '')
}

export const parseFlashcards = (content) => {
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

export const parseBody = async (req) => {
  if (req.body) return req.body

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