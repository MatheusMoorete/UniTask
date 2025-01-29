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
  browserLocalPersistence
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext()

// Função para logs seguros em produção
const logAuth = (message, data = {}) => {
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

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  function signup(email, password, name) {
    logAuth('Attempting signup', { name })
    return createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        logAuth('Signup successful, updating profile')
        return updateProfile(result.user, {
          displayName: name
        })
      })
      .catch(error => {
        logAuth('Signup failed', { error: error.message, code: error.code })
        throw error
      })
  }

  function login(email, password) {
    logAuth('Attempting login')
    return signInWithEmailAndPassword(auth, email, password)
      .catch(error => {
        logAuth('Login failed', { error: error.message, code: error.code })
        throw error
      })
  }

  function signInWithGoogle() {
    logAuth('Attempting Google sign in')
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
      .catch(error => {
        logAuth('Google sign in failed', { error: error.message, code: error.code })
        throw error
      })
  }

  function logout() {
    logAuth('Attempting logout')
    return signOut(auth)
      .catch(error => {
        logAuth('Logout failed', { error: error.message, code: error.code })
        throw error
      })
  }

  function resetPassword(email) {
    logAuth('Attempting password reset')
    return sendPasswordResetEmail(auth, email)
      .catch(error => {
        logAuth('Password reset failed', { error: error.message, code: error.code })
        throw error
      })
  }

  useEffect(() => {
    logAuth('Setting up auth state listener')
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        logAuth('Persistence set to local')
      })
      .catch(error => {
        logAuth('Failed to set persistence', { error: error.message, code: error.code })
      })

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        logAuth('User authenticated', { 
          uid: user.uid,
          displayName: user.displayName,
          isAnonymous: user.isAnonymous,
          emailVerified: user.emailVerified,
          providerData: user.providerData.map(p => ({ providerId: p.providerId }))
        })
      } else {
        logAuth('User signed out')
      }
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
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