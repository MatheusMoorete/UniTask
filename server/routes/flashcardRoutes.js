import { handleFlashcardGeneration } from '../controllers/flashcardController.js'

export const setupFlashcardRoutes = (app) => {
  app.all('/api/generate-flashcards', handleFlashcardGeneration)
} 