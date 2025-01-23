import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

export function useTaskListDragAndDrop({ columns, filteredTasks, reorderColumns, moveTask }) {
  const [draggedColumnId, setDraggedColumnId] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const handleDragStart = (event) => {
    const { active } = event
    const activeId = active.id

    const isColumn = columns.some(col => col.id === activeId)
    if (isColumn) {
      setDraggedColumnId(activeId)
    } else {
      setActiveId(activeId)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (draggedColumnId) {
      if (over && active.id !== over.id) {
        const oldIndex = columns.findIndex(col => col.id === active.id)
        const newIndex = columns.findIndex(col => col.id === over.id)
        
        const newColumns = arrayMove(columns, oldIndex, newIndex)
        await reorderColumns(newColumns)
      }
      setDraggedColumnId(null)
    } else {
      setActiveId(null)

      if (!over) return

      const activeTask = filteredTasks.find(t => t.id === active.id)
      if (!activeTask) return

      let targetColumnId
      if (typeof over.id === 'string' && over.id.includes('-empty')) {
        targetColumnId = over.id.split('-')[0]
      } else {
        const overTask = filteredTasks.find(t => t.id === over.id)
        targetColumnId = overTask?.columnId
      }

      if (!targetColumnId) return

      if (activeTask.columnId !== targetColumnId) {
        const tasksInTargetColumn = filteredTasks.filter(t => t.columnId === targetColumnId)
        const position = tasksInTargetColumn.length > 0
          ? Math.min(...tasksInTargetColumn.map(t => t.position)) - 1000
          : 1000
        await moveTask(activeTask.id, activeTask.columnId, targetColumnId, position)
      } else if (active.id !== over.id && !over.id.includes('-empty')) {
        const overTask = filteredTasks.find(t => t.id === over.id)
        if (!overTask) return

        const activeIndex = filteredTasks
          .filter(t => t.columnId === activeTask.columnId)
          .findIndex(t => t.id === active.id)
        const overIndex = filteredTasks
          .filter(t => t.columnId === overTask.columnId)
          .findIndex(t => t.id === over.id)

        const newPosition = overIndex > activeIndex
          ? overTask.position + 1000
          : overTask.position - 1000
        
        await moveTask(activeTask.id, activeTask.columnId, activeTask.columnId, newPosition)
      }
    }
  }

  return {
    draggedColumnId,
    activeId,
    handleDragStart,
    handleDragEnd
  }
} 