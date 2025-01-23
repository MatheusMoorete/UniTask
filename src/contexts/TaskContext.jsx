import { createContext, useContext } from 'react'
import { useFirestore } from './FirestoreContext'
import { useTasks } from '../hooks/useTasks'
import { useTaskHandlers } from '../hooks/useTaskHandlers'

const TaskContext = createContext({})

export function TaskProvider({ children }) {
  const { db } = useFirestore()
  
  // Dados e operações básicas das tarefas
  const {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus
  } = useTasks()

  // Handlers de UI e formulários
  const {
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    isDialogOpen,
    setIsDialogOpen,
    selectedTaskForReading,
    setSelectedTaskForReading,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm
  } = useTaskHandlers({
    addTask,
    updateTask,
    deleteTask,
    setError: () => {} // Implementar gerenciamento de erro
  })

  const contextValue = {
    // Estado das tarefas
    tasks,
    loading,
    
    // Operações básicas
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    
    // Estado do formulário e UI
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    isDialogOpen,
    setIsDialogOpen,
    selectedTaskForReading,
    setSelectedTaskForReading,
    
    // Handlers
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm
  }

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
} 