import { useFirestore } from './FirestoreContext'

export function TaskProvider({ children }) {
  const { db } = useFirestore()
  // ... resto do código
} 