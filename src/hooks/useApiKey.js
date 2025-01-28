import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

export function useApiKey() {
  const [apiKeys, setApiKeys] = useState({
    deepseek: null,
    openai: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const loadApiKeys = async () => {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setApiKeys({
          deepseek: data.deepseekApiKey || null,
          openai: data.openaiApiKey || null
        })
      }
      setIsLoading(false)
    }

    loadApiKeys()
  }, [user])

  const saveApiKey = async (provider, key) => {
    try {
      const updates = {}
      if (provider === 'deepseek') {
        updates.deepseekApiKey = key
      } else if (provider === 'openai') {
        updates.openaiApiKey = key
      }

      await setDoc(doc(db, 'users', user.uid), updates, { merge: true })
      setApiKeys(prev => ({
        ...prev,
        [provider]: key
      }))
    } catch (error) {
      console.error('Erro ao salvar API key:', error)
      throw error
    }
  }

  return { apiKeys, isLoading, saveApiKey }
} 