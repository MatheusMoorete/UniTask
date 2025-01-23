import { useState, useEffect } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { AddTaskForm } from "./AddTaskForm"
import { TaskColumn } from "./TaskColumn"
import { useBoard } from "../../hooks/useBoard"

export function Tasks() {
  const { 
    tasks, 
    loading, 
    addTask, 
    moveTask, 
    updateTask,
    deleteTask
  } = useBoard()

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find(task => task.id === active.id)
    if (activeTask.columnId !== over.id) {
      const destinationTasks = tasks.filter(task => task.columnId === over.id)
      const newPosition = destinationTasks.length * 1000 // Calcula nova posição
      
      moveTask(active.id, activeTask.columnId, over.id, newPosition)
    }
  }

  const getTasksByColumn = (columnId) => {
    return tasks
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.position - b.position)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      <AddTaskForm onAddTask={addTask} />
      
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <TaskColumn
            id="todo"
            tasks={getTasksByColumn('todo')}
            onEdit={updateTask}
          />
          <TaskColumn
            id="doing"
            tasks={getTasksByColumn('doing')}
            onEdit={updateTask}
          />
          <TaskColumn
            id="done"
            tasks={getTasksByColumn('done')}
            onEdit={updateTask}
          />
        </div>
      </DndContext>
    </div>
  )
} 