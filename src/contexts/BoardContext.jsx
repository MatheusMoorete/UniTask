import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useBoard } from '../hooks/useBoard'
import { useTags } from '../hooks/useTags'
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

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
  const [draggedColumnId, setDraggedColumnId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [activeColumnId, setActiveColumnId] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    moreInfo: '',
    tags: [],
    columnId: null
  })

  // Configuração dos sensores do DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // Handlers do DnD
  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    if (active.data.current?.type === 'column') {
      setDraggedColumnId(active.id)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      setDraggedColumnId(null)
      return
    }

    if (active.id !== over.id) {
      if (active.data.current?.type === 'column') {
        await reorderColumns(active.id, over.id)
      } else {
        const activeColumnId = active.data.current?.column?.id
        const overColumnId = over.data.current?.column?.id || over.id

        if (activeColumnId !== overColumnId) {
          await moveTask(active.id, overColumnId)
        }
      }
    }

    setActiveId(null)
    setDraggedColumnId(null)
  }

  const handleColumnAdd = async () => {
    if (newColumnTitle.trim()) {
      await addColumn(newColumnTitle.trim())
      setNewColumnTitle('')
      setIsColumnDialogOpen(false)
    }
  }

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
    setFilterTags,
    // Props específicas do TaskBoard
    draggedColumnId,
    activeId,
    sensors,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    isColumnDialogOpen,
    setIsColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
    onColumnAdd: handleColumnAdd,
    onColumnSelect: setActiveColumnId,
    activeColumnId,
    setEditingTask,
    setIsDialogOpen,
    setNewTask,
    onTaskDelete: deleteTask,
    onTaskEdit: updateTask,
    filteredTasks,
    onColumnUpdate: updateColumn,
    onColumnDelete: deleteColumn
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