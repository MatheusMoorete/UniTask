import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsMiddleware } from '../server/middleware/cors.js'
import { handleFlashcardGeneration } from '../server/controllers/flashcardController.js'

dotenv.config()

const app = express()

// Middlewares globais
app.use(cors())
app.use(express.json())
app.use(corsMiddleware)

// Rotas
app.post('/api/generate-flashcards', handleFlashcardGeneration)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
  })
}

// Para o Vercel
export default app 