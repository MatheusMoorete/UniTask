import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardHeader, CardTitle, CardDescription } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { GripVertical, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Button } from "../../ui/button"
import { motion } from "framer-motion"
import { cn } from "../../../lib/utils"

export function DraggableTask({ task, onEdit, onDelete, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        className="group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn(
          "relative border-2 transition-colors duration-200",
          isDragging ? "border-primary shadow-lg opacity-50" : "hover:border-primary/50"
        )}>
          {/* Grip Handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="absolute left-2 top-4 opacity-0 group-hover:opacity-100 
                     cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded-md transition-all"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <CardHeader className="p-3 pl-10">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base leading-tight">{task.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-500"
                      onClick={() => onDelete(task.id)}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <CardDescription className="leading-snug">
                  {task.description}
                </CardDescription>
              )}

              {task.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ 
                        backgroundColor: tag.color,
                        color: 'white'
                      }}
                      className="text-xs px-2 py-0"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </>
  )
} 