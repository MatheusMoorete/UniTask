import { createClient } from '@supabase/supabase-js'

// Logs para debug
console.log('Environment:', import.meta.env.MODE)
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error(`Supabase URL is required. Current value: ${supabaseUrl}`)
}

if (!supabaseAnonKey) {
  throw new Error('Supabase Anon Key is required')
}

console.log('SUPABASE URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('ENV:', import.meta.env)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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