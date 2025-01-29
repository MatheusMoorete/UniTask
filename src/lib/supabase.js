import { createClient } from '@supabase/supabase-js'

// Função para logs seguros em produção
const logSupabase = (message, data = {}) => {
  if (import.meta.env.MODE === 'development') {
    const sensitiveKeys = ['token', 'key', 'password', 'secret']
    const safeData = { ...data }
    
    // Remove dados sensíveis
    Object.keys(safeData).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        safeData[key] = '[REDACTED]'
      }
    })
    
    console.log(`[UniTask Supabase] ${message}`, safeData)
  }
}

// Verifica se as variáveis necessárias estão definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Missing Supabase configuration. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  logSupabase('Configuration Error', { error })
  throw new Error(error)
}

// Cria o cliente Supabase com retry e timeout
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'UniTask' }
  },
  realtime: {
    timeout: 30000, // 30 segundos
    params: {
      eventsPerSecond: 10
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)

// Função para autenticar com o token do Firebase
export const signInToSupabase = async (firebaseUser) => {
  try {
    logSupabase('Attempting Firebase token authentication')
    
    const { user, error } = await supabase.auth.signInWithCustomToken(
      await firebaseUser.getIdToken()
    )

    if (error) {
      logSupabase('Authentication failed', { error: error.message })
      throw error
    }

    logSupabase('Authentication successful')
    return user
  } catch (error) {
    logSupabase('Authentication error', { error: error.message })
    throw error
  }
}

// Exporta o cliente Supabase como default
export default supabase