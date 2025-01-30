import { useState, useEffect, useCallback } from 'react'
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
  getDoc,
} from 'firebase/firestore'

// Função auxiliar para calcular a próxima posição
const getNextPosition = (columns) => {
  if (!columns.length) return 1000
  const lastColumn = columns[columns.length - 1]
  return lastColumn.position + 1000
}

export function useBoard() {
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const { user } = useAuth()
  const { db } = useFirestore()
  const [board, setBoard] = useState(null)

  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setBoard(doc.data().board || null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

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
      setError('Erro ao carregar o quadro')
      setLoading(false)
    }
  }, [user, db])

  // Adicionar coluna
  const addColumn = async (title) => {
    try {
      if (!title || typeof title !== 'string') {
        throw new Error('O título deve ser uma string')
      }

      const trimmedTitle = title.trim()
      if (!trimmedTitle) {
        throw new Error('O título não pode estar vazio')
      }
      
      const newColumn = {
        title: trimmedTitle,
        userId: user.uid,
        position: getNextPosition(columns),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await addDoc(collection(db, 'columns'), newColumn)
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
  const addTask = async (taskData) => {
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }

      const columnTasks = tasks.filter(task => task.columnId === taskData.columnId)
      const lastTask = columnTasks[columnTasks.length - 1]
      const position = lastTask ? lastTask.position + 1000 : 1000

      const newTask = {
        title: String(taskData?.title || '').trim(),
        description: String(taskData?.description || '').trim(),
        moreInfo: String(taskData?.moreInfo || '').trim(),
        priority: String(taskData?.priority || 'média'),
        columnId: String(taskData?.columnId || 'todo'),
        position: Number(position),
        completed: Boolean(false),
        userId: String(user.uid),
        tags: Array.isArray(taskData?.tags) ? taskData.tags : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      throw error;
    }
  }

  // Mover tarefa - versão minimalista
  const moveTask = async (taskId, sourceColumnId, destinationColumnId, newPosition) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      
      // Atualizar apenas os campos necessários para a movimentação
      const updateData = {
        columnId: destinationColumnId,
        position: newPosition,
        updatedAt: serverTimestamp()
      }

      await updateDoc(taskRef, updateData)
    } catch (error) {
      console.error('Erro ao mover tarefa:', error)
      throw error
    }
  }

  // Reordenar colunas
  const reorderColumns = async (reorderedColumns) => {
    try {
      // Garantir que reorderedColumns é um array
      if (!Array.isArray(reorderedColumns)) {
        console.error('reorderedColumns não é um array:', reorderedColumns)
        return
      }

      // Criar um batch para atualizar todas as colunas de uma vez
      const batch = writeBatch(db)

      reorderedColumns.forEach((column, index) => {
        const columnRef = doc(db, 'columns', column.id)
        batch.update(columnRef, {
          position: index * 1000,
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Erro ao reordenar colunas:', error)
      throw error
    }
  }

  // Adicione esta função no useBoard
  const updateTask = async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      
      // Remover campos que não devem ser atualizados
      const { id, createdAt, ...updateData } = updates

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
    const taskRef = doc(db, 'tasks', taskId)
    await deleteDoc(taskRef)
  }

  const deleteTag = async (tagId) => {
    try {
      const batch = writeBatch(db)
      
      // Deletar a tag
      const tagRef = doc(db, 'tags', tagId)
      batch.delete(tagRef)

      // Atualizar todas as tarefas que usam esta tag
      const tasksWithTag = tasks.filter(task => 
        task.tags?.some(tag => tag.id === tagId)
      )

      tasksWithTag.forEach(task => {
        const taskRef = doc(db, 'tasks', task.id)
        batch.update(taskRef, {
          tags: task.tags.filter(tag => tag.id !== tagId),
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
      throw error
    }
  }

  return {
    columns,
    tasks,
    loading,
    error,
    searchQuery,
    selectedTags,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    moveTask,
    updateTask,
    reorderColumns,
    deleteTask,
    deleteTag,
  }
} 