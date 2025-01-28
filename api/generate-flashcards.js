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

    if (!content) {
      return res.status(400).json({ 
        error: 'Conteúdo não fornecido',
        details: 'O campo content é obrigatório'
      })
    }

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key não fornecida',
        details: 'O header X-API-KEY é obrigatório'
      })
    }

    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      deepseek: 'https://api.deepseek.com/v1/chat/completions'
    }

    const models = {
      openai: 'gpt-3.5-turbo',
      deepseek: 'deepseek-chat'
    }

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
            content: `Você é um assistente que cria flashcards de estudo. 
            Responda APENAS com um array JSON puro, sem formatação markdown.
            Exemplo do formato esperado:
            [
              {
                "front": "Pergunta 1?",
                "back": "Resposta 1"
              }
            ]`
          },
          {
            role: 'user',
            content: `Crie 5 flashcards sobre: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Handler] Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      return res.status(500).json({
        error: 'Erro na API do provedor',
        details: `${provider} retornou status ${response.status}`,
        providerError: errorText
      })
    }

    const data = await response.json()
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error('[Handler] Resposta inválida da API:', data)
      return res.status(500).json({
        error: 'Resposta inválida da API',
        details: 'A resposta não contém o formato esperado'
      })
    }

    let flashcards
    try {
      const content = data.choices[0].message.content
        .replace(/```json\n?/g, '')  // Remove ```json
        .replace(/```/g, '')         // Remove ```
        .trim()                      // Remove espaços

      const parsedContent = JSON.parse(content)
      
      // Verifica se veio no formato { flashcards: [...] } ou diretamente como array
      flashcards = Array.isArray(parsedContent) ? parsedContent : parsedContent.flashcards

      // Mapeia para o formato correto caso venha com pergunta/resposta em vez de front/back
      flashcards = flashcards.map(card => ({
        front: card.front || card.pergunta || '',
        back: card.back || card.resposta || ''
      }))

      if (!Array.isArray(flashcards) || flashcards.length !== 5) {
        throw new Error('A resposta deve ser um array com 5 flashcards')
      }

      if (!flashcards.every(card => card.front && card.back)) {
        throw new Error('Todos os flashcards devem ter front e back')
      }
    } catch (error) {
      console.error('[Handler] Erro ao processar flashcards:', error)
      console.error('[Handler] Conteúdo recebido:', data.choices[0].message.content)
      return res.status(500).json({
        error: 'Erro ao processar resposta',
        details: error.message,
        rawContent: data.choices[0].message.content
      })
    }

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
    console.error('[Handler] Erro crítico:', error)
    return res.status(500).json({ 
      error: 'Erro ao gerar flashcards',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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