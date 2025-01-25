import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore'

export function useStudyRoom() {
  const { user } = useAuth()
  const { db } = useFirestore()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Criar query
      const topicsQuery = query(
        collection(db, 'studyTopics'),
        where('userId', '==', user.uid),
        orderBy('position', 'asc')
      )
      
      // Configurar listener em tempo real
      const unsubscribe = onSnapshot(topicsQuery, (snapshot) => {
        const topicsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTopics(topicsData)
        setLoading(false)
      }, (error) => {
        console.error('Erro ao escutar tópicos:', error)
        setLoading(false)
      })

      // Limpar listener quando o componente for desmontado
      return () => unsubscribe()
    }
  }, [user, db])

  const createTopic = async (topicData) => {
    try {
      const position = topics.length ? Math.max(...topics.map(t => t.position)) + 1000 : 1000
      
      const newTopic = {
        ...topicData,
        userId: user.uid,
        position,
        progress: 0,
        topics: (topicData.topics || []).map(st => ({
          ...st,
          needsRevision: false,
          completed: false
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'studyTopics'), newTopic)
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar tópico:', error)
      throw error
    }
  }

  const updateTopic = async (topicId, updates) => {
    try {
      const topicRef = doc(db, 'studyTopics', topicId)
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await updateDoc(topicRef, updatedData)
    } catch (error) {
      console.error('Erro ao atualizar tópico:', error)
      throw error
    }
  }

  const deleteTopic = async (topicId) => {
    try {
      await deleteDoc(doc(db, 'studyTopics', topicId))
    } catch (error) {
      console.error('Erro ao deletar tópico:', error)
      throw error
    }
  }

  const reorderTopics = async (oldIndex, newIndex) => {
    try {
      const newTopics = [...topics]
      const [movedTopic] = newTopics.splice(oldIndex, 1)
      newTopics.splice(newIndex, 0, movedTopic)
      
      // Atualiza as posições
      const updates = newTopics.map((topic, index) => ({
        id: topic.id,
        position: index * 1000
      }))
      
      // Atualiza no Firestore
      await Promise.all(
        updates.map(({ id, position }) =>
          updateDoc(doc(db, 'studyTopics', id), { position })
        )
      )
      
      setTopics(newTopics)
    } catch (error) {
      console.error('Erro ao reordenar tópicos:', error)
      throw error
    }
  }

  const updateTopicProgress = async (topicId, updates) => {
    try {
      const topicRef = doc(db, 'studyTopics', topicId)
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await updateDoc(topicRef, updatedData)
      setTopics(prevTopics => 
        prevTopics.map(topic => 
          topic.id === topicId 
            ? { ...topic, ...updatedData }
            : topic
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error)
      throw error
    }
  }

  return {
    topics,
    loading,
    createTopic,
    updateTopic,
    deleteTopic,
    reorderTopics,
    updateTopicProgress
  }
} 