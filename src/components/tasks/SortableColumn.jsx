import { forwardRef, useState, useEffect } from 'react'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DraggableTask } from "./DraggableTask"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Plus, Trash2, Pencil, MoreVertical, GripVertical, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { DropIndicator } from "./DropIndicator"
import { Card } from "../ui/card"

export const SortableColumn = forwardRef(({ 
  column, 
  tasks = [], 
  onEdit, 
  onDelete,
  onTaskEdit,
  onTaskDelete,
  onSelect,
  isActive
}, ref) => {
  if (!column || !column.id) return null

  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(
    typeof column.title === 'object' ? column.title.title || '' : column.title || ''
  )

  useEffect(() => {
    setEditedTitle(typeof column.title === 'object' ? column.title.title || '' : column.title || '')
  }, [column.title])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: column.id,
    data: {
      type: 'column',
      column
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const emptyDropId = `${column.id}-empty`

  const handleSave = () => {
    if (editedTitle.trim() && onEdit) {
      onEdit(column.id, editedTitle.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedTitle(typeof column.title === 'object' ? column.title.title || '' : column.title || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleDeleteColumn = () => {
    if (onDelete && column.id) {
      onDelete(column.id)
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`w-[350px] flex-shrink-0 ${isDragging ? 'opacity-50' : ''} ${isActive ? 'ring-2 ring-primary' : ''}`}
      {...attributes}
    >
      <Card className="bg-muted/50 flex flex-col h-full">
      {/* Cabeçalho da Coluna */}
      <div className="px-3 h-[60px] border-b border-muted flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded-md"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 w-[200px] select-text cursor-text focus:ring-2 focus:ring-primary"
                maxLength={20}
                autoFocus
                onFocus={(e) => e.target.select()}
                placeholder="Digite o título da coluna"
              />
              <span className="text-xs text-muted-foreground absolute -bottom-5 left-0">
                {editedTitle.length}/20 caracteres
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8 hover:bg-green-100 hover:text-green-600"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h3 
              className="font-semibold hover:text-primary cursor-pointer" 
              onClick={() => setIsEditing(true)}
              title="Clique para editar"
            >
              {typeof column.title === 'object' ? column.title.title || 'Sem título' : column.title || 'Sem título'}
            </h3>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => {
                setIsEditing(true)
                setTimeout(() => {
                  const input = document.querySelector(`input[value="${editedTitle}"]`)
                  if (input) {
                    input.focus()
                    input.select()
                  }
                }, 100)
              }}
              className="hover:bg-accent/50"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteColumn}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lista de Tarefas */}
      <div className="p-2 flex-1">
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id}>
                  <DropIndicator active={isActive} over={{ id: task.id }} />
                  <DraggableTask
                    task={task}
                    onEdit={() => {
                      if (onTaskEdit) {
                        onTaskEdit(task, {
                          title: task.title,
                          description: task.description,
                          moreInfo: task.moreInfo,
                          tags: task.tags,
                          columnId: task.columnId
                        })
                      }
                    }}
                    onDelete={() => onTaskDelete && onTaskDelete(task.id)}
                    onClick={() => onSelect && onSelect(task.id)}
                  />
                </div>
              ))}
              <DropIndicator active={isActive} over={{ id: emptyDropId }} />
            </div>
          ) : (
            <div
              id={emptyDropId}
              className="h-full min-h-[150px] border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-sm text-muted-foreground p-4 text-center"
            >
              Crie uma nova tarefa ou arraste uma existente para esta coluna
            </div>
          )}
        </SortableContext>
      </div>

      {/* Botão de Adicionar */}
      <div className="p-2 mt-auto border-t">
        <Button
          variant="ghost"
          className="w-full justify-center text-muted-foreground hover:bg-accent/50"
          onClick={() => onTaskEdit && onTaskEdit(null, { columnId: column.id })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tarefa
        </Button>
      </div>
      </Card>
    </motion.div>
  )
})

SortableColumn.displayName = 'SortableColumn' 