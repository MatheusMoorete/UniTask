import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Badge } from "../ui/badge"
import { BoardColumn } from "./BoardColumn"
import { useTaskBoard } from "../../contexts/BoardContext"

export function DragPreview({ draggedItem, type }) {
  const { tasks } = useTaskBoard()
  
  if (!draggedItem) return null

  if (type === 'column') {
    const columnTasks = tasks.filter(task => task.columnId === draggedItem.id)
    return (
      <div className="w-80 opacity-80 rotate-3 pointer-events-none">
        <BoardColumn
          column={draggedItem}
          tasks={columnTasks}
          isDragging
          isOverlay
          onEdit={() => {}}
          onDelete={() => {}}
          onTaskAdd={() => {}}
          onTaskEdit={() => {}}
          onTaskDelete={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="w-[calc(100%-2rem)] max-w-sm opacity-80 rotate-3 pointer-events-none">
      <Card className="shadow-lg">
        <CardHeader className="p-4">
          <CardTitle className="text-base">{draggedItem.title}</CardTitle>
          {draggedItem.description && (
            <CardDescription>{draggedItem.description}</CardDescription>
          )}
          {draggedItem.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {draggedItem.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  )
} 