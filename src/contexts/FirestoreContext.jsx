import { createContext, useContext, useState, useEffect } from 'react'
import { setupFirestore } from '../lib/firebase'
import { Loading } from '../components/ui/loading'

const FirestoreContext = createContext()

// Função para logs seguros em produção
const logFirestore = (message, data = {}) => {
  const sensitiveKeys = ['token', 'key', 'password', 'secret']
  const safeData = { ...data }
  
  // Remove dados sensíveis
  Object.keys(safeData).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      safeData[key] = '[REDACTED]'
    }
  })
  
  console.log(`[UniTask Firestore] ${message}`, safeData)
}

export function FirestoreProvider({ children }) {
    const [db, setDb] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let mounted = true
        logFirestore('Iniciando configuração do Firestore')

        async function initFirestore() {
            try {
                logFirestore('Obtendo instância do Firestore')
                const firestoreInstance = await setupFirestore()
                
                if (mounted) {
                    logFirestore('Firestore inicializado com sucesso', {
                        isInitialized: !!firestoreInstance
                    })
                    setDb(firestoreInstance)
                    setLoading(false)
                }
            } catch (err) {
                logFirestore('Erro ao inicializar Firestore', { 
                    error: err.message,
                    code: err.code,
                    stack: err.stack
                })
                if (mounted) {
                    setError(err)
                    setLoading(false)
                }
            }
        }

        initFirestore()

        return () => {
            mounted = false
            logFirestore('Limpando provider do Firestore')
        }
    }, [])

    if (loading) {
        return <Loading fullScreen message="Inicializando banco de dados..." />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">
                    Erro ao inicializar o banco de dados. Por favor, recarregue a página.
                </div>
            </div>
        )
    }

    return (
        <FirestoreContext.Provider value={{ db }}>
            {children}
        </FirestoreContext.Provider>
    )
}

export function useFirestore() {
    const context = useContext(FirestoreContext)
    if (!context) {
        throw new Error('useFirestore deve ser usado dentro de um FirestoreProvider')
    }
    return context
}