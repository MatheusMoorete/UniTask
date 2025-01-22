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
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

export function useBoard() {
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { db } = useFirestore()

  // Carregar colunas e tarefas
  useEffect(() => {
    if (!user) {
      setColumns([])
      setTasks([])
      setLoading(false)
      return
    }

    try {
      // Carregar colunas
      const columnsQuery = query(
        collection(db, 'columns'),
        where('userId', '==', user.uid),
        orderBy('position')
      )

      const unsubscribeColumns = onSnapshot(columnsQuery, (snapshot) => {
        const columnsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }))
        setColumns(columnsData)
      })

      // Carregar tarefas
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('position')
      )

      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }))
        setTasks(tasksData)
        setLoading(false)
      })

      return () => {
        unsubscribeColumns()
        unsubscribeTasks()
      }
    } catch (error) {
      console.error('Erro ao carregar quadro:', error)
      setLoading(false)
    }
  }, [user, db])

  // Adicionar coluna
  const addColumn = async (title) => {
    try {
      const lastColumn = columns[columns.length - 1]
      const position = lastColumn ? lastColumn.position + 1000 : 1000

      const columnData = {
        title: title.trim(),
        position,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'columns'), columnData)
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error)
      throw error
    }
  }

  // Atualizar coluna
  const updateColumn = async (columnId, updates) => {
    try {
      const columnRef = doc(db, 'columns', columnId)
      await updateDoc(columnRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error)
      throw error
    }
  }

  // Deletar coluna
  const deleteColumn = async (columnId) => {
    try {
      const batch = writeBatch(db)
      
      // Deletar a coluna
      const columnRef = doc(db, 'columns', columnId)
      batch.delete(columnRef)

      // Deletar todas as tarefas da coluna
      const columnTasks = tasks.filter(task => task.columnId === columnId)
      columnTasks.forEach(task => {
        const taskRef = doc(db, 'tasks', task.id)
        batch.delete(taskRef)
      })

      await batch.commit()
    } catch (error) {
      console.error('Erro ao deletar coluna:', error)
      throw error
    }
  }

  // Adicionar tarefa
  const addTask = async (columnId, taskData) => {
    try {
      const columnTasks = tasks.filter(task => task.columnId === columnId)
      const lastTask = columnTasks[columnTasks.length - 1]
      const position = lastTask ? lastTask.position + 1000 : 1000

      const newTask = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        moreInfo: taskData.moreInfo?.trim() || '',
        tags: taskData.tags || [],
        columnId,
        position,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'tasks'), newTask)
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
      throw error
    }
  }

  // Mover tarefa
  const moveTask = async (taskId, sourceColumnId, destinationColumnId, newPosition) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        columnId: destinationColumnId,
        position: newPosition,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao mover tarefa:', error)
      throw error
    }
  }

  // Reordenar colunas
  const reorderColumns = async (reorderedColumns) => {
    try {
      const batch = writeBatch(db)
      
      reorderedColumns.forEach((column, index) => {
        const columnRef = doc(db, 'columns', column.id)
        batch.update(columnRef, {
          position: (index + 1) * 1000,
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Erro ao reordenar colunas:', error)
      throw error
    }
  }

  return {
    columns,
    tasks,
    loading,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    moveTask,
    reorderColumns
  }
} 