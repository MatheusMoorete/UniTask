import fetch from 'node-fetch'

export const config = {
  runtime: 'edge'
}

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-KEY, X-PROVIDER',
  'Content-Type': 'application/json'
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

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const body = await req.json()
    const { content } = body
    const apiKey = req.headers.get('x-api-key')
    const provider = req.headers.get('x-provider') || 'deepseek'

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key não fornecida' }), {
        status: 401,
        headers: corsHeaders
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
      return new Response(JSON.stringify({
        error: `Erro na API do ${provider}`,
        details: `${response.status} ${response.statusText}`
      }), {
        status: response.status,
        headers: corsHeaders
      })
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
      return new Response(JSON.stringify({
        error: 'Erro ao processar resposta da API',
        details: error.message
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return new Response(JSON.stringify({
        error: 'Nenhum flashcard foi gerado'
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    if (!flashcards.every(card => card.front && card.back)) {
      return new Response(JSON.stringify({
        error: 'Alguns flashcards estão com formato inválido'
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify(flashcards)
        }
      }]
    }), {
      status: 200,
      headers: corsHeaders
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Erro ao gerar flashcards',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
} 