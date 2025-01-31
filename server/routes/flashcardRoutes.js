import { Router } from 'express'
import { handleFlashcardGeneration } from '../controllers/flashcardController.js'

const router = Router()

router.post('/generate-flashcards', handleFlashcardGeneration)

export const setupFlashcardRoutes = (app) => {
  app.use('/api', router)
} 