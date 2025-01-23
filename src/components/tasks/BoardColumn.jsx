import { useState, useRef, useEffect, forwardRef } from 'react'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Trash2, Pencil, MoreHorizontal, GripVertical, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { DraggableTask } from "./DraggableTask"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export const BoardColumn = forwardRef(({ 
  column, 
  tasks = [],
  onEdit, 
  onDelete, 
  onTaskAdd,
  onTaskEdit,
  onTaskDelete,
  isDragging,
  isOverlay 
}, ref) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const inputRef = useRef(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: column.id,
    data: {
      type: 'column',
      column,
    },
    disabled: isOverlay,
    transition: {
      duration: 500,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  })

  // Combina as refs
  const handleRefs = (el) => {
    setNodeRef(el)
    if (ref) {
      if (typeof ref === 'function') {
        ref(el)
      } else {
        ref.current = el
      }
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onEdit(column.id, { title: title.trim() })
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle(column.title)
      setIsEditing(false)
    }
  }

  // Cria um ID único para a área de drop vazia
  const emptyDropId = `${column.id}-empty`

  return (
    <motion.div
      ref={handleRefs}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      initial={false}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? "0 8px 24px rgba(0, 0, 0, 0.15)" : "none",
        opacity: isDragging ? 0.6 : 1,
      }}
      className={cn(
        "flex-shrink-0 w-80 bg-muted/50 rounded-lg group",
        isOverlay && "pointer-events-none"
      )}
      layout
      layoutId={column.id}
    >
      {/* Cabeçalho */}
      <div className="p-4 border-b border-muted relative">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex-1 mr-2">
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="h-7 py-1"
              />
            </form>
          ) : (
            <div className="flex items-center justify-between w-full">
              {/* Grip Handle para a coluna */}
              <div 
                {...attributes} 
                {...listeners}
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                          cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded-md transition-all"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              <h3 
                className="text-lg font-semibold cursor-pointer hover:text-muted-foreground transition-colors pl-8"
                onClick={() => setIsEditing(true)}
              >
                {column.title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(column.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Área de tarefas */}
      <div className="p-4">
        <div className="space-y-2">
          <SortableContext
            items={tasks.length > 0 ? tasks.map(task => task.id) : [emptyDropId]}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <DraggableTask
                  key={task.id}
                  task={task}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                />
              ))
            ) : (
              <div
                id={emptyDropId}
                data-id={emptyDropId}
                className="h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <p className="text-center px-4">
                  Crie uma nova tarefa ou arraste uma existente para esta coluna
                </p>
              </div>
            )}
          </SortableContext>
        </div>
      </div>

      {/* Botão de adicionar tarefa */}
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
          onClick={() => onTaskAdd(column.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tarefa
        </Button>
      </div>
    </motion.div>
  )
})

// Adiciona um displayName para melhorar o debugging
BoardColumn.displayName = 'BoardColumn' 