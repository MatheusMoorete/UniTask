import { validateRequest, parseBody, sanitizeLogs } from '../utils/flashcardUtils.js'
import { generateFlashcards } from '../services/flashcardService.js'

export const handleFlashcardGeneration = async (req, res) => {
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
    const body = await parseBody(req)
    
    console.log('Request recebida:', {
      method: req.method,
      url: req.url,
      headers: sanitizeLogs(req.headers),
      bodyContent: body.content ? body.content.substring(0, 50) + '...' : undefined
    })

    const content = validateRequest(body)
    const apiKey = req.headers['x-api-key']
    const provider = req.headers['x-provider'] || 'deepseek'

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key não fornecida',
        details: 'Header X-API-KEY é obrigatório'
      })
    }

    const flashcards = await generateFlashcards(content, apiKey, provider)

    return res.json({ 
      choices: [{ message: { content: JSON.stringify(flashcards) } }]
    })

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