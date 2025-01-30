import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

export function useTaskListDragAndDrop({ columns, tasks, reorderColumns, moveTask }) {
  const [activeId, setActiveId] = useState(null)
  const [draggedColumnId, setDraggedColumnId] = useState(null)

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    
    if (active.data.current?.type === 'column') {
      setDraggedColumnId(active.id)
    }
  }

  const handleDragEnd = async (event) => {
    try {
      const { active, over } = event
      
      if (!over) return

      // Se estiver arrastando uma coluna
      if (active.data.current?.type === 'column') {
        const activeColumnIndex = columns.findIndex(col => col.id === active.id)
        const overColumnIndex = columns.findIndex(col => col.id === over.id)

        if (activeColumnIndex !== overColumnIndex) {
          const newColumns = [...columns]
          const [movedColumn] = newColumns.splice(activeColumnIndex, 1)
          newColumns.splice(overColumnIndex, 0, movedColumn)
          
          if (Array.isArray(newColumns) && newColumns.length > 0) {
            await reorderColumns(newColumns)
          }
        }
        return
      }

      // Movimentação de Tarefas
      else {
        const activeTask = tasks.find(task => task.id === active.id)
        
        if (!activeTask) return

        let targetColumnId

        // Verifica se é um drop em área droppable de coluna vazia
        if (over.id.toString().includes('-droppable')) {
          targetColumnId = over.data.current?.columnId
        } 
        // Se dropou sobre uma tarefa
        else if (over.data.current?.type === 'task') {
          const overTask = tasks.find(task => task.id === over.id)
          if (overTask) {
            targetColumnId = overTask.columnId
          }
        }
        // Se dropou diretamente sobre uma coluna
        else if (over.data.current?.type === 'column') {
          targetColumnId = over.id
        }

        // Se encontrou uma coluna de destino válida
        if (targetColumnId && activeTask.columnId !== targetColumnId) {
          const tasksInTargetColumn = tasks.filter(t => t.columnId === targetColumnId)
          const newPosition = tasksInTargetColumn.length > 0
            ? tasksInTargetColumn[tasksInTargetColumn.length - 1].position + 1000
            : 1000

          await moveTask(
            active.id,
            activeTask.columnId,
            targetColumnId,
            newPosition
          )
        }
      }
    } catch (error) {
      console.error('Erro ao mover item:', error)
    }

    setActiveId(null)
    setDraggedColumnId(null)
  }

  return {
    draggedColumnId,
    activeId,
    handleDragStart,
    handleDragEnd
  }
} 