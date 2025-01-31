import axios from 'axios'

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

export default api 