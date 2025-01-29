import { createClient } from '@supabase/supabase-js'

// Log seguro para ambiente
console.log('Environment:', import.meta.env.MODE)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY))

// Verifica se as variáveis necessárias estão definidas
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required')
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

// Cria o cliente Supabase
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const signInToSupabase = async (firebaseUser) => {
  try {
    const { user, error } = await supabase.auth.signInWithCustomToken(
      await firebaseUser.getIdToken()
    )

    if (error) {
      throw error
    }

    return user
  } catch (error) {
    console.error('Erro ao autenticar no Supabase:', error)
    throw error
  }
}

export default supabase