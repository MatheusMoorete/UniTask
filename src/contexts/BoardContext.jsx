import { createContext, useContext, useState, useCallback } from 'react'
import { useBoard } from '../hooks/useBoard'
import { useTags } from '../hooks/useTags'

const BoardContext = createContext({})

export function BoardProvider({ children }) {
  const { 
    columns, 
    tasks, 
    loading, 
    addColumn, 
    updateColumn, 
    deleteColumn, 
    addTask, 
    moveTask,
    updateTask,
    deleteTask,
    reorderColumns 
  } = useBoard()

  const { 
    tags, 
    addTag, 
    deleteTag 
  } = useTags()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError] = useState(null)

  // Filtragem de tasks
  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      // Busca por texto
      const searchTerms = searchQuery.toLowerCase().trim()
      const matchesSearch = !searchTerms || 
        task.title?.toLowerCase().includes(searchTerms) ||
        task.description?.toLowerCase().includes(searchTerms)

      // Filtragem por tags
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(selectedTag =>
          task.tags?.some(taskTag => taskTag.id === selectedTag.id)
        )

      return matchesSearch && matchesTags
    })
  }, [tasks, searchQuery, selectedTags])

  const handleError = (error, customMessage) => {
    console.error(error)
    setError(customMessage || 'Ocorreu um erro. Tente novamente.')
    setTimeout(() => setError(null), 5000)
  }

  // Valor do contexto
  const contextValue = {
    columns,
    tasks: getFilteredTasks(),
    tags: tags || [],
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
    deleteTask,
    reorderColumns,
    addTag,
    deleteTag,
    setSearchQuery,
    setSelectedTags,
    setError
  }

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  )
}

export const useTaskBoard = () => {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error('useTaskBoard must be used within a BoardProvider')
  }
  return context
} 