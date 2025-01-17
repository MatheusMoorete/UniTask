import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setTags([])
      setLoading(false)
      return
    }

    try {
      const q = query(
        collection(db, 'tags'),
        where('userId', '==', user.uid)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tagsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTags(tagsData)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
      setLoading(false)
    }
  }, [user])

  const addTag = async (name, color = '#e2e8f0') => {
    try {
      await addDoc(collection(db, 'tags'), {
        name,
        color,
        userId: user.uid,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao adicionar tag:', error)
      throw error
    }
  }

  const deleteTag = async (tagId) => {
    try {
      const tagRef = doc(db, 'tags', tagId)
      await deleteDoc(tagRef)
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
      throw error
    }
  }

  return {
    tags,
    loading,
    addTag,
    deleteTag
  }
} 