import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { 
  orderBy, 
  getDocs
} from 'firebase/firestore'

export function useNotebook() {
  const { user } = useAuth()
  const { db } = useFirestore()
  const [notes, setNotes] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState(null)

  useEffect(() => {
    if (user) {
      Promise.all([fetchNotes(), fetchTopics()])
        .finally(() => setLoading(false))
    }
  }, [user])

  const fetchTopics = async () => {
    try {
      const topicsQuery = query(
        collection(db, 'topics'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(topicsQuery)
      const topicsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setTopics(topicsData)
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(notesQuery)
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setNotes(notesData)
    } catch (error) {
      console.error('Erro ao buscar notas:', error)
    }
  }

  const createNote = async (noteData) => {
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        ...noteData,
        userId: user.uid,
        topicId: selectedTopic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      await fetchNotes()
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar nota:', error)
      throw error
    }
  }

  const createTopic = async (topicData) => {
    try {
      const docRef = await addDoc(collection(db, 'topics'), {
        ...topicData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      })

      await fetchTopics()
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar tópico:', error)
      throw error
    }
  }

  const deleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId))
      await fetchNotes()
    } catch (error) {
      console.error('Erro ao deletar nota:', error)
      throw error
    }
  }

  const deleteTopic = async (topicId) => {
    try {
      await deleteDoc(doc(db, 'topics', topicId))
      await fetchTopics()
    } catch (error) {
      console.error('Erro ao deletar tópico:', error)
      throw error
    }
  }

  return {
    notes,
    topics,
    loading,
    selectedTopic,
    setSelectedTopic,
    createNote,
    createTopic,
    deleteNote,
    deleteTopic,
    fetchNotes,
    fetchTopics
  }
} 