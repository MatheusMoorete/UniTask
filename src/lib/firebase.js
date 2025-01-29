import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'

// Função para logs seguros em produção
const logFirebase = (message, data = {}) => {
  if (import.meta.env.MODE === 'development') {
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

// Verifica se as variáveis essenciais estão definidas
const essentialEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
]

const missingEssentialVars = essentialEnvVars.filter(varName => !import.meta.env[varName])
if (missingEssentialVars.length > 0) {
  const error = `Missing essential Firebase environment variables: ${missingEssentialVars.join(', ')}`
  logFirebase('Environment Error', { error })
  throw new Error(error)
}

let app
let auth
let db
let analytics = null

try {
  // Inicializa o Firebase
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  
  // Configura persistência local
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      logFirebase('Auth persistence set to local')
    })
    .catch((error) => {
      logFirebase('Error setting auth persistence', { error: error.message })
      // Não lança o erro, apenas loga
    })

  // Inicializa Analytics apenas se suportado
  if (typeof window !== 'undefined') {
    isSupported()
      .then(isSupported => {
        if (isSupported) {
          analytics = getAnalytics(app)
          logFirebase('Analytics initialized')
        }
      })
      .catch(error => {
        logFirebase('Analytics not supported', { error: error.message })
      })
  }

  logFirebase('Firebase initialized successfully')
} catch (error) {
  logFirebase('Error initializing Firebase', { error: error.message })
  throw error
}

export async function setupFirestore() {
  try {
    if (!db) {
      db = getFirestore(app)
    }
    return db
  } catch (error) {
    logFirebase('Error setting up Firestore', { error: error.message })
    throw error
  }
}

export { app as default, auth, db, analytics }