import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'

// Função para logs seguros em produção
const logFirebase = (message, data = {}) => {
  const sensitiveKeys = ['token', 'key', 'password', 'secret', 'api']
  const safeData = { ...data }
  
  // Remove dados sensíveis
  Object.keys(safeData).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      safeData[key] = '[REDACTED]'
    }
  })
  
  console.log(`[UniTask Firebase] ${message}`, safeData)
}

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Verifica se todas as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
]

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
if (missingEnvVars.length > 0) {
  logFirebase('Missing environment variables', { missing: missingEnvVars })
}

// Initialize Firebase
try {
  logFirebase('Initializing Firebase', { 
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: Boolean(firebaseConfig.apiKey)
  })
  
  const app = initializeApp(firebaseConfig)
  export const auth = getAuth(app)
  export const db = getFirestore(app)
  
  try {
    export const analytics = getAnalytics(app)
    logFirebase('Analytics initialized')
  } catch (error) {
    logFirebase('Failed to initialize analytics', { error: error.message })
  }

  // Configuração de persistência
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      logFirebase('Auth persistence set to local')
    })
    .catch((error) => {
      logFirebase('Failed to set auth persistence', { error: error.message })
    })

  logFirebase('Firebase initialized successfully')
} catch (error) {
  logFirebase('Failed to initialize Firebase', { error: error.message })
  throw error
}

let firestoreInstance = null

export async function setupFirestore() {
    if (firestoreInstance) {
      logFirebase('Using existing Firestore instance')
      return firestoreInstance
    }

    try {
        logFirebase('Setting up new Firestore instance')
        firestoreInstance = getFirestore(app)
        logFirebase('Firestore setup successful')
        return firestoreInstance
    } catch (err) {
        logFirebase('Error setting up Firestore', { error: err.message })
        if (!firestoreInstance) {
            logFirebase('Attempting to get Firestore instance after error')
            firestoreInstance = getFirestore(app)
        }
        return firestoreInstance
    }
}

export default app