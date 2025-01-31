import api from './api'
import { API_ENDPOINTS } from '../constants'

export const generateFlashcards = async (content, quantity, apiKey, provider = 'deepseek') => {
  try {
    const response = await api.post(API_ENDPOINTS.GENERATE_FLASHCARDS, 
      { content, quantity },
      {
        headers: {
          'X-API-KEY': apiKey,
          'X-PROVIDER': provider
        }
      }
    )
    
    return JSON.parse(response.data.choices[0].message.content)
  } catch (error) {
    console.error('Erro ao gerar flashcards:', error)
    throw new Error(error.response?.data?.details || error.message)
  }
} 