import { createClient } from '@supabase/supabase-js'

// Log seguro para ambiente
console.log('Environment:', import.meta.env.MODE)

// Verifica se as variáveis necessárias estão definidas
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is required')
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

// Cria o cliente Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const signInToSupabase = async (firebaseUser) => {
  try {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: firebaseUser.email,
      password: firebaseUser.uid // Usando o UID do Firebase como senha
    })

    if (error) {
      // Se o usuário não existe, criar um novo
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: firebaseUser.email,
        password: firebaseUser.uid
      })

      if (signUpError) throw signUpError
      return data.session
    }

    return session
  } catch (error) {
    console.error('Erro ao autenticar no Supabase:', error)
    throw error
  }
}

export default supabase