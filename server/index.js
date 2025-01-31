import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { setupFlashcardRoutes } from './routes/flashcardRoutes.js'
import { corsMiddleware } from './middleware/cors.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares globais
app.use(cors())
app.use(express.json())
app.use(corsMiddleware)

// Setup routes
setupFlashcardRoutes(app)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
}) 