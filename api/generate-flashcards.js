import fetch from 'node-fetch'

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-KEY, X-PROVIDER'
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const makeRequestWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429 && i < retries - 1) {
        await delay((i + 1) * 5000)
        continue
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await delay(1000)
    }
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-KEY, X-PROVIDER')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { content } = req.body
    const apiKey = req.headers['x-api-key']
    const provider = req.headers['x-provider'] || 'deepseek'

    if (!apiKey) {
      res.status(401).json({ error: 'API key não fornecida' })
      return
    }

    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      deepseek: 'https://api.deepseek.com/v1/chat/completions'
    }

    const models = {
      openai: 'gpt-3.5-turbo',
      deepseek: 'deepseek-chat'
    }

    const prompt = `
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
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Erro na API do ${provider}: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    let flashcards

    try {
      const content = data.choices[0].message.content
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```/g, '')
        .replace(/^\s*\[\s*/, '[')
        .replace(/\s*\]\s*$/, ']')
        .trim()

      flashcards = JSON.parse(cleanContent)
    } catch (error) {
      throw new Error('Erro ao processar resposta da API: ' + error.message)
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error('Nenhum flashcard foi gerado')
    }

    if (!flashcards.every(card => card.front && card.back)) {
      throw new Error('Alguns flashcards estão com formato inválido')
    }

    res.json({
      choices: [{
        message: {
          content: JSON.stringify(flashcards)
        }
      }]
    })
  } catch (error) {
    console.error('Erro detalhado:', error)
    res.status(500).json({ 
      error: 'Erro ao gerar flashcards',
      details: error.message
    })
  }
} 