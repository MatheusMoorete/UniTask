import { useFirestore } from '../contexts/FirestoreContext'

export function usePomodoroSettings() {
  const { db } = useFirestore()
  // ... resto do código
} 