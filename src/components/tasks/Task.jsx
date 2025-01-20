import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { Trash2, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"

const priorityColors = {
  alta: "text-red-500 bg-red-50 dark:bg-red-950/50",
  média: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50",
  baixa: "text-green-500 bg-green-50 dark:bg-green-950/50"
}

const Task = ({ task, onComplete, onDelete }) => {
  return (
    <div className={cn(
      "group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4",
      task.completed && "bg-muted/50"
    )}>
      <div className="flex items-start sm:items-center gap-3 w-full">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onComplete(task.id)}
          className="mt-1 sm:mt-0"
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
              priorityColors[task.priority]
            )}>
              <AlertCircle className="h-3 w-3" />
              {task.priority}
            </div>
            <span className="text-xs text-muted-foreground">
              {task.subject}
            </span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
      </Button>
    </div>
  )
}

export default Task 