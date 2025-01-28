import fetch from 'node-fetch'

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { content } = req.body
    const apiKey = req.headers['x-api-key']

    if (!apiKey) {
      return res.status(401).json({ error: 'API key não fornecida' })
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar flashcards de estudo. Retorne apenas um array JSON puro, ' +
              'sem formatação markdown. Cada objeto do array deve ter "front" (pergunta/conceito) e "back" (resposta/explicação).'
          },
          {
            role: 'user',
            content: `Crie 5 flashcards de estudo a partir do seguinte conteúdo. Retorne apenas o array JSON puro:\n\n${content}`
          }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error('Falha na API do Deepseek')
    }

    const data = await response.json()
    return res.json(data)
  } catch (error) {
    console.error('Erro:', error)
    return res.status(500).json({ error: 'Erro ao gerar flashcards' })
  }
} 