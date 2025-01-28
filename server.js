import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()

app.use(cors())
app.use(express.json())

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const makeRequestWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429 && i < retries - 1) {
        console.log(`Rate limit atingido, tentando novamente em ${(i + 1) * 5} segundos...`)
        await delay((i + 1) * 5000) // Espera 5, 10, 15 segundos entre tentativas
        continue
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Tentativa ${i + 1} falhou, tentando novamente...`)
      await delay(1000)
    }
  }
}

app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { content } = req.body
    const apiKey = req.headers['x-api-key']
    const provider = req.headers['x-provider'] || 'deepseek'

    console.log('Recebendo requisição:', { provider, contentLength: content?.length })

    if (!apiKey) {
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

    console.log('Fazendo requisição para:', endpoints[provider])

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
      console.error('Erro na API:', errorData)
      throw new Error(`Erro na API do ${provider}: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Resposta bruta da API:', data)

    let flashcards
    try {
      const content = data.choices[0].message.content
      console.log('Conteúdo da resposta:', content)

      // Remove qualquer formatação markdown e espaços extras
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```/g, '')
        .replace(/^\s*\[\s*/, '[')
        .replace(/\s*\]\s*$/, ']')
        .trim()

      console.log('Conteúdo limpo:', cleanContent)
      flashcards = JSON.parse(cleanContent)
    } catch (error) {
      console.error('Erro ao parsear resposta:', error)
      throw new Error('Erro ao processar resposta da API: ' + error.message)
    }

    // Valida o formato dos flashcards
    if (!Array.isArray(flashcards)) {
      console.error('Resposta não é um array:', flashcards)
      throw new Error('Resposta não é um array válido')
    }

    if (flashcards.length === 0) {
      throw new Error('Nenhum flashcard foi gerado')
    }

    if (!flashcards.every(card => card.front && card.back)) {
      console.error('Flashcards inválidos:', flashcards)
      throw new Error('Alguns flashcards estão com formato inválido')
    }

    const formattedResponse = {
      choices: [{
        message: {
          content: JSON.stringify(flashcards)
        }
      }]
    }

    console.log('Enviando resposta:', formattedResponse)
    res.json(formattedResponse)
  } catch (error) {
    console.error('Erro detalhado:', error)
    res.status(500).json({ 
      error: 'Erro ao gerar flashcards',
      details: error.message,
      stack: error.stack
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
}) 