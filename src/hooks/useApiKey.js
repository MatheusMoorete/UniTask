import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

export function useApiKey() {
  const [apiKey, setApiKey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const loadApiKey = async () => {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists() && docSnap.data().deepseekApiKey) {
        setApiKey(docSnap.data().deepseekApiKey)
      }
      setIsLoading(false)
    }

    loadApiKey()
  }, [user])

  const saveApiKey = async (key) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        deepseekApiKey: key
      }, { merge: true })
      setApiKey(key)
    } catch (error) {
      console.error('Erro ao salvar API key:', error)
      throw error
    }
  }

  return { apiKey, isLoading, saveApiKey }
} 