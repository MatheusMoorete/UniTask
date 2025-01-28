import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { content } = req.body

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}`
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
    res.json(data)
  } catch (error) {
    console.error('Erro:', error)
    res.status(500).json({ error: 'Erro ao gerar flashcards' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
}) 