import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import generateFlashcards from './generate-flashcards.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.post('/api/generate-flashcards', generateFlashcards)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})
