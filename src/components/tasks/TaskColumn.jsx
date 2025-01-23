import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DraggableTask } from "./DraggableTask"

const columnTitles = {
  todo: "A Fazer",
  doing: "Em Andamento",
  done: "Concluído"
}

export function TaskColumn({ id, tasks, onEdit, onDelete }) {
  const { setNodeRef } = useDroppable({ id })

  const handleEdit = async (taskId, updates) => {
    try {
      await onEdit(taskId, updates)
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await onDelete(taskId)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }

  return (
    <div className="flex flex-col gap-4 min-w-[300px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{columnTitles[id]}</h3>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 min-h-[200px] p-2 bg-muted/30 rounded-lg"
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
} 