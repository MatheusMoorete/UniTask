import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()

// Log de todas as requisições
app.use((req, res, next) => {
  const sanitizedHeaders = { ...req.headers }
  // Remove sensitive information
  if (sanitizedHeaders['x-api-key']) {
    sanitizedHeaders['x-api-key'] = '***********'
  }
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  console.log('Headers:', sanitizedHeaders)
  // Só loga o body se existir e não for vazio
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', {
      ...req.body,
      content: req.body.content?.substring(0, 50) + '...' // Limita o tamanho do conteúdo no log
    })
  }
  next()
})

app.use(cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-KEY', 'X-PROVIDER']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const makeRequestWithRetry = async (url, options) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout ao chamar a API')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

const handler = async (req, res) => {
  const startTime = Date.now()
  
  try {
    const { content } = req.body
    const apiKey = req.headers['x-api-key']
    const provider = req.headers['x-provider'] || 'deepseek'

    console.log('[Handler] Provider:', provider)
    console.log('[Handler] Content length:', content?.length)
    console.log('[Handler] API Key present:', !!apiKey)

    if (!apiKey) {
      console.log('[Handler] Erro: API key não fornecida')
      return res.status(401).json({ error: 'API key não fornecida' })
    }

    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      deepseek: 'https://api.deepseek.com/v1/chat/completions'
    }

    const models = {
      openai: 'gpt-3.5-turbo',
      deepseek: 'deepseek-chat'
    }

    console.log('[Handler] Fazendo requisição para:', endpoints[provider])

    const response = await makeRequestWithRetry(endpoints[provider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: models[provider],
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que cria flashcards de estudo. Responda apenas com JSON puro, sem formatação markdown ou texto adicional.'
          },
          {
            role: 'user',
            content: `Crie 5 flashcards de estudo baseados no seguinte conteúdo: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Handler] Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      throw new Error(`Erro na API do ${provider}: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Handler] Resposta da API recebida:', JSON.stringify(data, null, 2))

    const flashcards = JSON.parse(data.choices[0].message.content)

    const executionTime = Date.now() - startTime
    console.log(`Tempo de execução: ${executionTime}ms`)

    return res.json({
      choices: [{
        message: {
          content: JSON.stringify(flashcards)
        }
      }]
    })
  } catch (error) {
    console.error('Erro:', error)
    return res.status(500).json({ 
      error: 'Erro ao gerar flashcards',
      details: error.message
    })
  }
}

// Log de erros não tratados
app.use((err, req, res, next) => {
  console.error('[Error Handler] Erro não tratado:', err)
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: err.message,
    stack: err.stack
  })
})

app.post('/api/generate-flashcards', handler)

export default app 