import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext'
import { useTaskBoard } from '../contexts/BoardContext'
import { useTags } from '../hooks/useTags'
import { KeyboardSensor, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { BoardHeader } from '../components/tasks/BoardHeader'
import { TaskBoard } from '../components/tasks/TaskBoard'
import { TaskDialog } from '../components/tasks/TaskDialog'
import { DeleteTagDialog } from '../components/tasks/DeleteTagDialog'
import { TaskListState } from '../components/tasks/TaskListState'
import { useTaskListDragAndDrop } from '../hooks/useTaskListDragAndDrop'
import { useTagHandlers } from '../components/tasks/TagHandlers'
import { useColumnHandlers } from '../components/tasks/ColumnHandlers'
import { useTaskForm } from '../hooks/useTaskForm'
import { useTasks } from '../hooks/useTasks'
import { ErrorToast } from '../components/tasks/ErrorToast'
import { DragOverlay } from '@dnd-kit/core'
import { DraggableTask } from '../components/tasks/DraggableTask'
import { BoardColumn } from '../components/tasks/BoardColumn'
import { TagManager } from '../components/tasks/TagManager'

export default function TaskList() {
  const { user } = useAuth()
  const { isAuthenticated } = useGoogleCalendar()
  const {
    columns,
    tasks,
    loading,
    error,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    moveTask,
    updateTask,
    deleteTask,
    reorderColumns,
    setError,
    filterTags
  } = useTaskBoard()
  
  const { tags, addTag, deleteTag } = useTags()
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [tagToDelete, setTagToDelete] = useState(null)
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const boardRef = useRef(null)
  const [activeColumnId, setActiveColumnId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const {
    newTask,
    setNewTask,
    editingTask,
    setEditingTask,
    isDialogOpen,
    setIsDialogOpen,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateTag
  } = useTaskForm({
    addTask,
    updateTask,
    deleteTask,
    addTag,
    setError,
    columnId: activeColumnId
  })

  const {
    handleTagSelect,
    handleRemoveTag,
    handleDeleteTag
  } = useTagHandlers({
    newTask,
    setNewTask,
    updateTask,
    deleteTag,
    setError
  })

  const {
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumn
  } = useColumnHandlers({
    addColumn,
    updateColumn,
    deleteColumn,
    setError
  })

  const {
    draggedColumnId,
    activeId,
    handleDragStart,
    handleDragEnd
  } = useTaskListDragAndDrop({
    columns,
    tasks,
    reorderColumns,
    moveTask
  })

  const handleColumnSelect = (columnId) => {
    setActiveColumnId(columnId)
  }

  const filteredTasks = tasks.filter(task => {
    // Primeiro filtra por texto de busca
    const matchesSearch = !searchQuery || (
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    
    // Depois filtra por tags selecionadas
    const matchesTags = filterTags.length === 0 || (
      task.tags?.some(taskTag => 
        filterTags.some(filterTag => filterTag.id === taskTag.id)
      )
    )
    
    // Retorna true apenas se passar em ambos os filtros
    return matchesSearch && matchesTags
  })

  const activeTask = tasks.find(task => task.id === activeId)
  const activeColumn = columns.find(column => column.id === activeColumnId)
  const columnTasks = tasks.filter(task => task.columnId === activeColumnId)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TaskListState user={user} loading={loading} error={error} />
      
      <div className="p-6 flex-shrink-0 bg-background w-full">
        <BoardHeader 
          onSearch={setSearchQuery} 
          onManageTags={() => setIsTagManagerOpen(true)} 
        />
      </div>

      <div className="flex-1 min-h-0 relative">
        <TaskBoard
          columns={columns}
          filteredTasks={filteredTasks}
          draggedColumnId={draggedColumnId}
          activeId={activeId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={closestCenter}
          onColumnUpdate={handleUpdateColumn}
          onColumnDelete={handleDeleteColumn}
          isColumnDialogOpen={isColumnDialogOpen}
          setIsColumnDialogOpen={setIsColumnDialogOpen}
          newColumnTitle={newColumnTitle}
          setNewColumnTitle={setNewColumnTitle}
          onColumnAdd={handleAddColumn}
          onColumnSelect={handleColumnSelect}
          activeColumnId={activeColumnId}
          setEditingTask={setEditingTask}
          setIsDialogOpen={setIsDialogOpen}
          setNewTask={setNewTask}
          onTaskDelete={handleDelete}
          onTaskEdit={(task, initialData) => {
            if (task) {
              setEditingTask(task)
              setNewTask({
                title: task.title || '',
                description: task.description || '',
                moreInfo: task.moreInfo || '',
                tags: task.tags || [],
                columnId: task.columnId
              })
            } else {
              setEditingTask(null)
              setNewTask(prev => ({ ...prev, ...initialData }))
            }
            setIsDialogOpen(true)
          }}
        />
      </div>

      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={newTask}
        editingTask={editingTask}
        onSubmit={handleSubmit}
        onChange={setNewTask}
        tags={tags}
        onTagSelect={handleTagSelect}
        onTagCreate={handleCreateTag}
        setTagToDelete={setTagToDelete}
        error={error}
      />

      <DeleteTagDialog
        tag={tagToDelete}
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDeleteTag}
      />

      <ErrorToast error={error} />

      <DragOverlay>
        {activeId ? (
          activeTask ? (
            <DraggableTask task={activeTask} isDragging />
          ) : (
            <BoardColumn 
              column={activeColumn} 
              tasks={columnTasks} 
              isOverlay 
            />
          )
        ) : null}
      </DragOverlay>

      <TagManager
        isOpen={isTagManagerOpen}
        onOpenChange={setIsTagManagerOpen}
        tags={tags}
        onTagCreate={handleCreateTag}
        onTagDelete={setTagToDelete}
        error={error}
        setError={setError}
      />
    </div>
  )
} 