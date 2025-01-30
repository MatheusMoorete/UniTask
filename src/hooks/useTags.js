import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
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

export function useTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { db } = useFirestore()

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

  const addTag = async (name, color) => {
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado')
      }

      const newTag = {
        name: name.trim(),
        color: color,
        userId: user.uid,
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'tags'), newTag)
      
      return {
        id: docRef.id,
        ...newTag,
        createdAt: new Date()
      }
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