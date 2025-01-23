import { useState } from "react"
import { Checkbox } from "../ui/checkbox"
import { AlertCircle, GripVertical } from "lucide-react"
import { cn } from "../../lib/utils"
import { EditTaskDialog } from "./EditTaskDialog"
import { Badge } from "../ui/badge"

const priorityColors = {
  alta: "text-red-500 bg-red-50 dark:bg-red-950/50",
  média: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50",
  baixa: "text-green-500 bg-green-50 dark:bg-green-950/50"
}

export function Task({ task, onEdit, onDelete, dragHandleProps }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3 group">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onEdit(task.id, { completed: checked })}
          onClick={(e) => e.stopPropagation()}
        />
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setShowEditDialog(true)}
        >
          <p className={cn(
            "font-medium truncate",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-muted-foreground truncate">
              {task.description}
            </p>
          )}
          {task.priority && (
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                priorityColors[task.priority]
              )}>
                <AlertCircle className="h-3 w-3" />
                {task.priority}
              </div>
            </div>
          )}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div 
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-accent rounded-md transition-all cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onEdit={onEdit}
      />
    </>
  )
} 