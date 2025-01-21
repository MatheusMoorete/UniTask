import { createContext, useContext, useState, useEffect } from 'react'
import { setupFirestore } from '../lib/firebase'
import { Loading } from '../components/ui/loading'

const FirestoreContext = createContext()

export function FirestoreProvider({ children }) {
    const [db, setDb] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let mounted = true

        async function initFirestore() {
            try {
                const firestoreInstance = await setupFirestore()
                if (mounted) {
                    setDb(firestoreInstance)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Erro ao inicializar Firestore:', err)
                if (mounted) {
                    setError(err)
                    setLoading(false)
                }
            }
        }

        initFirestore()

        return () => {
            mounted = false
        }
    }, [])

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-medium text-destructive">
                        Erro ao carregar o aplicativo
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Por favor, tente novamente mais tarde
                    </p>
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