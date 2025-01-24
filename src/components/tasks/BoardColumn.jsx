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
import { Badge } from "../ui/badge"
import { useDroppable } from '@dnd-kit/core'

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
      duration: 750,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1.2)'
    }
  })

  // Adiciona o hook useDroppable para a área vazia
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `${column.id}-droppable`,
    data: {
      type: 'column',
      columnId: column.id
    }
  })

  console.log('Configuração da coluna:', {
    columnId: column.id,
    droppableId: `${column.id}-droppable`,
    tasksCount: tasks.length
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

  return (
    <div className="relative">
      {/* Áreas arrastáveis - bordas da coluna */}
      <div 
        className="absolute inset-y-0 -left-2 w-4 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      />
      <div 
        className="absolute inset-y-0 -right-2 w-4 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      />

      {/* Conteúdo da coluna - não arrastável */}
      <div
        ref={handleRefs}
        className={cn(
          "w-[350px] shrink-0 bg-card rounded-lg flex flex-col",
          isDragging && "opacity-50",
          isOverlay && "shadow-2xl rotate-3"
        )}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          transitionProperty: "transform, opacity"
        }}
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{column.title}</span>
            <Badge variant="secondary">
              {tasks.length}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(column)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(column.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lista de tarefas */}
        <div 
          className="flex-1 p-4"
          onClick={(e) => e.stopPropagation()}
          data-column-id={column.id}
        >
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                  />
                ))}
              </div>
            ) : (
              <div
                ref={setDroppableRef}
                className={cn(
                  "h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-sm transition-colors",
                  "border-muted-foreground/20 text-muted-foreground",
                  "hover:border-primary/50 hover:bg-accent/50"
                )}
                data-column-id={column.id}
                onClick={() => console.log('Área droppable clicada:', column.id)}
              >
                <p className="text-center px-4">
                  Arraste uma tarefa ou crie uma nova
                </p>
              </div>
            )}
          </SortableContext>
        </div>

        {/* Botão de adicionar tarefa */}
        <div 
          className="p-4 pt-0 mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
            onClick={() => onTaskAdd(column.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Tarefa
          </Button>
        </div>
      </div>
    </div>
  )
})

// Adiciona um displayName para melhorar o debugging
BoardColumn.displayName = 'BoardColumn' 