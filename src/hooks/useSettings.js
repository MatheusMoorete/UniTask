import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore'

export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { db } = useFirestore()

  useEffect(() => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    const fetchSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', user.uid)
        const settingsSnap = await getDoc(settingsRef)
        
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data())
        } else {
          // Configurações padrão se não existirem
          const defaultSettings = {
            // suas configurações padrão aqui
          }
          await setDoc(settingsRef, defaultSettings)
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user, db])

  const updateSettings = async (newSettings) => {
    try {
      const settingsRef = doc(db, 'settings', user.uid)
      await updateDoc(settingsRef, newSettings)
      setSettings(prev => ({ ...prev, ...newSettings }))
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings
  }
} 