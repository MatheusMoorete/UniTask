import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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