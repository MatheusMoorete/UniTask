import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import { useSemester } from '../contexts/SemesterContext'
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
  serverTimestamp,
  limit
} from 'firebase/firestore'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { db } = useFirestore()
  const { activeSemesterId } = useSemester()

  useEffect(() => {
    if (!user || !activeSemesterId) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('semesterId', '==', activeSemesterId),
        orderBy('createdAt', 'desc'),
        limit(100)
      )

      const unsubscribe = onSnapshot(tasksQuery, 
        (snapshot) => {
          const tasksData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          }))
          setTasks(tasksData)
          setLoading(false)
        },
        (error) => {
          console.error('Erro ao carregar tarefas:', error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('Erro ao configurar listener de tarefas:', error)
      setLoading(false)
    }
  }, [user, db, activeSemesterId])

  const addTask = async (taskData) => {
    try {
      const newTask = {
        title: taskData.title.trim(),
        description: taskData.description || '',
        moreInfo: taskData.moreInfo || '',
        completed: false,
        userId: user.uid,
        semesterId: activeSemesterId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await addDoc(collection(db, 'tasks'), newTask)
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
      throw error
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      const { tags, ...updateData } = updates
      
      await updateDoc(taskRef, {
        ...updateData,
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

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus
  }
} 