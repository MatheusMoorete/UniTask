import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext()

// Função para logs seguros em produção
const logAuth = (message, data = {}) => {
  if (import.meta.env.MODE === 'development') {
    const sensitiveKeys = ['token', 'key', 'password', 'secret', 'email']
    const safeData = { ...data }
    
    // Remove dados sensíveis
    Object.keys(safeData).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        safeData[key] = '[REDACTED]'
      }
    })
    
    console.log(`[UniTask Auth] ${message}`, safeData)
  }
}

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Função para lidar com erros de autenticação
  const handleAuthError = (error) => {
    logAuth('Auth error occurred', { code: error.code })
    
    // Mapeia códigos de erro para mensagens amigáveis
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-email': 'Email inválido.',
      'auth/email-already-in-use': 'Este email já está em uso.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/popup-closed-by-user': 'Login cancelado.',
      'auth/operation-not-allowed': 'Operação não permitida.',
      'auth/invalid-credential': 'Credenciais inválidas.'
    }

    const message = errorMessages[error.code] || 'Ocorreu um erro durante a autenticação.'
    setError(message)
    throw new Error(message)
  }

  function signup(email, password, name) {
    logAuth('Attempting signup', { name })
    setError(null)
    
    return createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        logAuth('Signup successful, updating profile')
        return updateProfile(result.user, {
          displayName: name
        })
      })
      .catch(handleAuthError)
  }

  function login(email, password) {
    logAuth('Attempting login')
    setError(null)
    
    return signInWithEmailAndPassword(auth, email, password)
      .catch(handleAuthError)
  }

  function signInWithGoogle() {
    logAuth('Attempting Google sign in')
    setError(null)
    
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    return signInWithPopup(auth, provider)
      .catch(handleAuthError)
  }

  function logout() {
    logAuth('Attempting logout')
    setError(null)
    
    return signOut(auth)
      .catch(handleAuthError)
  }

  function resetPassword(email) {
    logAuth('Attempting password reset')
    setError(null)
    
    return sendPasswordResetEmail(auth, email)
      .catch(handleAuthError)
  }

  useEffect(() => {
    logAuth('Setting up auth state listener')
    
    // Configurar persistência local
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        logAuth('Local persistence configured successfully')
      })
      .catch((error) => {
        logAuth('Local persistence failed, trying session persistence', { error: error.message })
        // Se falhar, tenta persistência de sessão
        return setPersistence(auth, browserSessionPersistence)
      })
      .catch((error) => {
        logAuth('Session persistence failed', { error: error.message })
        // Se ambos falharem, continua sem persistência
      })

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      logAuth('Auth state changed', { 
        isAuthenticated: !!user,
        displayName: user?.displayName,
        uid: user?.uid
      })
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    error,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}