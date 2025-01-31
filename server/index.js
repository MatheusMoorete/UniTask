import express from 'express'
import cors from 'cors'
import { setupFlashcardRoutes } from './routes/flashcardRoutes.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Setup routes
setupFlashcardRoutes(app)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 