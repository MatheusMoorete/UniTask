import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'

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
  const error = `Missing environment variables: ${missingEnvVars.join(', ')}`
  logFirebase('Environment Error', { error })
  throw new Error(error)
}

// Log das variáveis de ambiente (de forma segura)
logFirebase('Initializing Firebase', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: Boolean(firebaseConfig.apiKey)
})

let app
let auth
let db
let analytics

try {
  // Inicializa o Firebase
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  
  // Configura persistência local
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      logFirebase('Auth persistence set to local')
    })
    .catch((error) => {
      logFirebase('Error setting auth persistence', { error: error.message })
    })

  // Inicializa Analytics apenas no navegador
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
    logFirebase('Analytics initialized')
  }

  logFirebase('Firebase initialized successfully')
} catch (error) {
  logFirebase('Error initializing Firebase', { error: error.message })
  throw error
}

export async function setupFirestore() {
  try {
    if (db) {
      logFirebase('Using existing Firestore instance')
      return db
    }

    logFirebase('Setting up new Firestore instance')
    db = getFirestore(app)
    
    // Tenta fazer uma operação simples para verificar a conexão
    const testCollection = collection(db, '_test')
    await getDocs(testCollection).catch(() => {}) // Ignora erro se a coleção não existir
    
    logFirebase('Firestore setup successful')
    return db
  } catch (error) {
    logFirebase('Error setting up Firestore', { error: error.message })
    throw error
  }
}

export { app as default, auth, db, analytics }