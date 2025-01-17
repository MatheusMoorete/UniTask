import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTasks(tasksData)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
      setLoading(false)
    }
  }, [user])

  const addTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        completed: false,
        tags: taskData.tags || []
      })
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
      throw error
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      throw error
    }
  }

  const toggleTaskStatus = async (taskId, completed) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        completed,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error)
      throw error
    }
  }

  const addTagToTask = async (taskId, tag) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      const task = tasks.find(t => t.id === taskId)
      const currentTags = task.tags || []
      
      if (!currentTags.some(t => t.id === tag.id)) {
        await updateDoc(taskRef, {
          tags: [...currentTags, tag],
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar tag à tarefa:', error)
      throw error
    }
  }

  const removeTagFromTask = async (taskId, tagId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      const task = tasks.find(t => t.id === taskId)
      const currentTags = task.tags || []
      
      await updateDoc(taskRef, {
        tags: currentTags.filter(tag => tag.id !== tagId),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao remover tag da tarefa:', error)
      throw error
    }
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addTagToTask,
    removeTagFromTask
  }
} 