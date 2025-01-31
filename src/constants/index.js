// API endpoints
export const API_ENDPOINTS = {
  GENERATE_FLASHCARDS: '/api/generate-flashcards',
  AUTH: '/api/auth',
  TASKS: '/api/tasks',
  NOTES: '/api/notes',
  CALENDAR: '/api/calendar'
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme'
}

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  AUTH: 'Erro de autenticação. Por favor, faça login novamente.',
  VALIDATION: 'Por favor, verifique os dados informados.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE: 'Dados salvos com sucesso!',
  DELETE: 'Item excluído com sucesso!',
  UPDATE: 'Atualização realizada com sucesso!'
}

// Pagination
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_PAGES_SHOWN: 5
} 