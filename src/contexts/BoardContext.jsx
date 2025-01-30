import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useBoard } from '../hooks/useBoard'
import { useTags } from '../hooks/useTags'

const BoardContext = createContext({})

export function BoardProvider({ children }) {
  const {
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
    setSearchQuery,
    setSelectedTags,
    setError
  } = useBoard()

  const { tags, addTag } = useTags()

  const [filterTags, setFilterTags] = useState([])

  // Atualiza selectedTags quando uma tag é excluída
  useEffect(() => {
    if (selectedTags.length > 0) {
      const validSelectedTags = selectedTags.filter(selectedTag =>
        tags.some(tag => tag.id === selectedTag.id)
      )
      if (validSelectedTags.length !== selectedTags.length) {
        setSelectedTags(validSelectedTags)
      }
    }
  }, [tags, selectedTags])

  // Filtragem de tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Busca por texto
      const searchTerms = searchQuery.toLowerCase().trim()
      const matchesSearch = !searchTerms || 
        task.title?.toLowerCase().includes(searchTerms) ||
        task.description?.toLowerCase().includes(searchTerms)

      // Filtro por tags - verifica se as tags ainda existem
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(selectedTag => 
          task.tags?.some(taskTag => 
            taskTag.id === selectedTag.id && 
            tags.some(tag => tag.id === selectedTag.id)
          )
        )

      return matchesSearch && matchesTags
    })
  }, [tasks, searchQuery, selectedTags, tags])

  const contextValue = {
    columns,
    tasks: filteredTasks,
    loading,
    error,
    tags,
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
    addTag,
    setSearchQuery,
    setSelectedTags,
    setError,
    filterTags,
    setFilterTags
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