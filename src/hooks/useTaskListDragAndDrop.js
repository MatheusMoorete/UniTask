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
    const { active, over } = event
    
    console.log('DragEnd Event:', {
      activeId: active.id,
      activeData: active.data.current,
      overId: over?.id,
      overData: over?.data.current
    })
    
    if (!over) {
      console.log('Sem elemento over - drop fora de área válida')
      return
    }

    if (active.id === over.id) {
      console.log('Drop no mesmo elemento - ignorando')
      setActiveId(null)
      setDraggedColumnId(null)
      return
    }

    try {
      // Movimentação de Colunas
      if (active.data.current?.type === 'column') {
        console.log('Movendo coluna')
        const activeColumnIndex = columns.findIndex(col => col.id === active.id)
        const overColumnIndex = columns.findIndex(col => col.id === over.id)
        
        console.log('Índices das colunas:', { activeColumnIndex, overColumnIndex })
        
        if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
          await reorderColumns(activeColumnIndex, overColumnIndex)
        }
      }
      // Movimentação de Tarefas
      else {
        console.log('Movendo tarefa')
        const activeTask = tasks.find(task => task.id === active.id)
        console.log('Tarefa sendo movida:', activeTask)

        if (!activeTask) {
          console.log('Tarefa não encontrada')
          return
        }

        let targetColumnId

        // Verifica se é um drop em área droppable de coluna vazia
        if (over.id.toString().includes('-droppable')) {
          console.log('Drop em área droppable de coluna vazia')
          targetColumnId = over.data.current?.columnId
        } 
        // Se dropou sobre uma tarefa
        else if (over.data.current?.type === 'task') {
          console.log('Drop sobre uma tarefa')
          const overTask = tasks.find(task => task.id === over.id)
          if (overTask) {
            targetColumnId = overTask.columnId
          }
        }
        // Se dropou diretamente sobre uma coluna
        else if (over.data.current?.type === 'column') {
          console.log('Drop direto sobre coluna')
          targetColumnId = over.id
        }

        console.log('Target Column ID:', targetColumnId)

        // Se encontrou uma coluna de destino válida
        if (targetColumnId && activeTask.columnId !== targetColumnId) {
          console.log('Movendo para nova coluna:', {
            de: activeTask.columnId,
            para: targetColumnId
          })

          const tasksInTargetColumn = tasks.filter(t => t.columnId === targetColumnId)
          const newPosition = tasksInTargetColumn.length > 0
            ? tasksInTargetColumn[tasksInTargetColumn.length - 1].position + 1000
            : 1000

          console.log('Nova posição calculada:', newPosition)

          await moveTask(
            active.id,
            activeTask.columnId,
            targetColumnId,
            newPosition
          )
        } else {
          console.log('Movimento inválido ou mesma coluna:', {
            targetColumnId,
            currentColumnId: activeTask.columnId
          })
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