import axios from 'axios'
import { getFunctions, httpsCallable } from 'firebase/functions'

const baseURL = import.meta.env.DEV 
  ? 'http://localhost:3000'
  : 'https://www.unitask.space'

const api = axios.create({
  baseURL,
  timeout: 45000, // 45 segundos
  headers: {
    'Content-Type': 'application/json'
  }
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro na resposta:', error.response.data)
      throw new Error(error.response.data.details || error.response.data.error || 'Erro no servidor')
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Erro na requisição:', error.request)
      throw new Error('Erro de conexão. Verifique sua internet.')
    } else {
      // Algo aconteceu na configuração da requisição
      console.error('Erro:', error.message)
      throw new Error('Erro ao fazer requisição')
    }
  }
)

const functions = getFunctions()

// Serviço centralizado para API
export const apiService = {
  // Matérias
  async createSubject(subjectData) {
    try {
      const validateAndCreateSubject = httpsCallable(functions, 'validateAndCreateSubject')
      const result = await validateAndCreateSubject(subjectData)
      return result.data
    } catch (error) {
      console.error('Erro ao criar matéria:', error.message)
      throw error
    }
  },
  
  async updateSubject(subjectId, subjectData) {
    try {
      const validateAndUpdateSubject = httpsCallable(functions, 'validateAndUpdateSubject')
      const result = await validateAndUpdateSubject({ id: subjectId, ...subjectData })
      return result.data
    } catch (error) {
      console.error('Erro ao atualizar matéria:', error.message)
      throw error
    }
  },
  
  async deleteSubject(subjectId) {
    try {
      const validateAndDeleteSubject = httpsCallable(functions, 'validateAndDeleteSubject')
      const result = await validateAndDeleteSubject({ id: subjectId })
      return result.data
    } catch (error) {
      console.error('Erro ao excluir matéria:', error.message)
      throw error
    }
  },
  
  // Notas
  async addGrade(subjectId, gradeData) {
    try {
      const validateAndAddGrade = httpsCallable(functions, 'validateAndAddGrade')
      const result = await validateAndAddGrade({ subjectId, ...gradeData })
      return result.data
    } catch (error) {
      console.error('Erro ao adicionar nota:', error.message)
      throw error
    }
  },
  
  async updateGrade(subjectId, gradeId, gradeData) {
    try {
      const validateAndUpdateGrade = httpsCallable(functions, 'validateAndUpdateGrade')
      const result = await validateAndUpdateGrade({ 
        subjectId, 
        gradeId, 
        ...gradeData 
      })
      return result.data
    } catch (error) {
      console.error('Erro ao atualizar nota:', error.message)
      throw error
    }
  },
  
  async deleteGrade(subjectId, gradeId) {
    try {
      const validateAndDeleteGrade = httpsCallable(functions, 'validateAndDeleteGrade')
      const result = await validateAndDeleteGrade({ subjectId, gradeId })
      return result.data
    } catch (error) {
      console.error('Erro ao excluir nota:', error.message)
      throw error
    }
  }
}

export default api 