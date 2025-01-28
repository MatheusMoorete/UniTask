import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { content } = await request.json()

    const prompt = `
      Crie flashcards de estudo a partir do seguinte conteúdo. 
      Gere no máximo 5 flashcards no formato JSON.
      Cada flashcard deve ter:
      - front: A pergunta ou conceito
      - back: A resposta ou explicação
      
      Conteúdo:
      ${content}
      
      Retorne apenas o array JSON com os flashcards, sem explicações adicionais.
    `

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error('Falha na API do Deepseek')
    }

    const data = await response.json()
    const flashcards = JSON.parse(data.choices[0].message.content)

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Erro ao gerar flashcards:', error)
    return NextResponse.error()
  }
} 