import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

export function useDragAndDrop({ onTaskMove, onColumnMove }) {
  const [activeId, setActiveId] = useState(null)
  const [draggedColumnId, setDraggedColumnId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    const activeId = active.id

    // Verifica se é uma coluna ou uma tarefa sendo arrastada
    if (active.data.current?.type === 'column') {
      setDraggedColumnId(activeId)
    } else {
      setActiveId(activeId)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      if (draggedColumnId) {
        // Reordenar colunas
        await onColumnMove(active.id, over.id)
      } else {
        // Mover tarefa
        const overId = over.id
        if (overId.includes('-empty')) {
          // Tarefa movida para coluna vazia
          const columnId = overId.split('-empty')[0]
          await onTaskMove(active.id, columnId, 1000)
        } else {
          // Tarefa movida para outra posição
          await onTaskMove(active.id, over.data.current.columnId, over.data.current.position)
        }
      }
    }

    setActiveId(null)
    setDraggedColumnId(null)
  }

  return {
    sensors,
    activeId,
    draggedColumnId,
    handleDragStart,
    handleDragEnd
  }
} 