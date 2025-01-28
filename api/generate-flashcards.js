import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const app = express()

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  console.log('Headers:', req.headers)
  console.log('Body:', req.body)
  next()
})

app.use(cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-KEY', 'X-PROVIDER']
}))

app.use(express.json())

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const makeRequestWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[${new Date().toISOString()}] Tentativa ${i + 1} para ${url}`)
      console.log('Options:', JSON.stringify(options, null, 2))
      
      const response = await fetch(url, options)
      console.log(`[${new Date().toISOString()}] Resposta status:`, response.status)
      
      if (response.status === 429 && i < retries - 1) {
        console.log(`Rate limit atingido, aguardando ${(i + 1) * 5} segundos...`)
        await delay((i + 1) * 5000)
        continue
      }
      return response
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Erro na tentativa ${i + 1}:`, error)
      if (i === retries - 1) throw error
      await delay(1000)
    }
  }
}

const handler = async (req, res) => {
  console.log('[Handler] Iniciando processamento da requisição')
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
            content: `
              Crie exatamente 5 flashcards de estudo baseados no seguinte conteúdo.
              Retorne apenas um array JSON com os flashcards, sem texto adicional.
              Cada flashcard deve ter os campos "front" (pergunta) e "back" (resposta).
              
              Exemplo do formato esperado:
              [
                {
                  "front": "Pergunta 1?",
                  "back": "Resposta 1"
                }
              ]

              Conteúdo: ${content}
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Handler] Erro na resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      throw new Error(`Erro na API do ${provider}: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[Handler] Resposta da API recebida:', JSON.stringify(data, null, 2))

    let flashcards
    try {
      const content = data.choices[0].message.content
      console.log('[Handler] Conteúdo bruto:', content)

      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```/g, '')
        .replace(/^\s*\[\s*/, '[')
        .replace(/\s*\]\s*$/, ']')
        .trim()
      
      console.log('[Handler] Conteúdo limpo:', cleanContent)
      flashcards = JSON.parse(cleanContent)
    } catch (error) {
      console.error('[Handler] Erro ao processar resposta:', error)
      throw new Error('Erro ao processar resposta da API: ' + error.message)
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      console.error('[Handler] Flashcards inválidos:', flashcards)
      throw new Error('Nenhum flashcard foi gerado')
    }

    console.log('[Handler] Flashcards gerados:', flashcards)

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
      stack: error.stack
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