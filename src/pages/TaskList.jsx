import { useState, useRef, useEffect } from 'react'
import { useBoard } from '../hooks/useBoard'
import { useTags } from '../hooks/useTags'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, Tag, X, Search, ChevronRight, MoreVertical, ChevronLeft, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext'
import { Calendar } from '../components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { cn } from '../lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

// Cores predefinidas para tags
const tagColors = [
  '#ef4444', // Vermelho
  '#f97316', // Laranja
  '#f59e0b', // Âmbar
  '#84cc16', // Verde Lima
  '#22c55e', // Verde
  '#14b8a6', // Teal
  '#0ea5e9', // Azul Claro
  '#6366f1', // Índigo
  '#a855f7', // Roxo
  '#ec4899', // Rosa
  '#64748b', // Cinza Azulado
]

// Componente para tornar o cartão arrastável
const SortableTaskCard = ({ task, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: 'move',
    position: 'relative',
    zIndex: isDragging ? 1 : 0
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription>
                  {task.description}
                </CardDescription>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-6 w-6"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

// Componente para tornar a coluna arrastável
const SortableColumn = ({ column, children, onEdit, onDelete, filteredTasks, setNewTask, setIsDialogOpen, handleEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onEdit(column.id, editTitle, true)
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditTitle(column.title)
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 0
  }

  // Filtra as tarefas desta coluna
  const columnTasks = filteredTasks.filter(task => task.columnId === column.id)
  
  // Cria um ID único para a área de drop vazia
  const emptyDropId = `${column.id}-empty`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-muted/50 rounded-lg"
    >
      {/* Cabeçalho não arrastável */}
      <div className="p-4 border-b border-muted">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                onEdit(column.id, editTitle, true)
                setIsEditing(false)
              }}
              onKeyDown={handleKeyDown}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-lg font-semibold shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <div className="flex items-center justify-between w-full">
              <h3 
                className="text-lg font-semibold cursor-pointer hover:text-muted-foreground transition-colors"
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
                    <MoreHorizontal className="h-4 w-4" />
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

      {/* Área arrastável */}
      <div className="p-4 cursor-move" {...attributes} {...listeners}>
        <div className="space-y-2">
          <SortableContext
            items={columnTasks.length > 0 
              ? columnTasks.map(task => task.id)
              : [emptyDropId]}
            strategy={verticalListSortingStrategy}
          >
            {columnTasks.length > 0 ? (
              columnTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
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

      {/* Botão de adicionar tarefa separado da área arrastável */}
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
          onClick={() => {
            setNewTask({
              title: '',
              description: '',
              moreInfo: '',
              tags: [],
              columnId: column.id
            })
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tarefa
        </Button>
      </div>
    </div>
  )
}

export default function TaskList() {
  const { user } = useAuth()
  const { isAuthenticated } = useGoogleCalendar()
  const { columns, tasks, loading, addColumn, updateColumn, deleteColumn, addTask, moveTask, reorderColumns } = useBoard()
  const { tags, addTag, deleteTag, setTags } = useTags()
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    moreInfo: '',
    tags: [],
    columnId: null
  })
  const [editingTask, setEditingTask] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [error, setError] = useState(null)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [editingColumn, setEditingColumn] = useState(null)
  const [selectedTaskForReading, setSelectedTaskForReading] = useState(null)
  const [tagToDelete, setTagToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [scrollPosition, setScrollPosition] = useState(0)
  const boardRef = useRef(null)
  const [draggedColumnId, setDraggedColumnId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validar campos obrigatórios
    if (!newTask.title?.trim()) {
      setError('O título da tarefa é obrigatório')
      return
    }

    // Validar se tem pelo menos uma tag
    if (newTask.tags.length === 0) {
      setError('Adicione pelo menos uma tag à tarefa')
      return
    }

    // Validar se uma coluna foi selecionada
    if (!newTask.columnId) {
      setError('Selecione uma coluna para a tarefa')
      return
    }

    try {
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description?.trim() || '',
        moreInfo: newTask.moreInfo?.trim() || '',
        tags: newTask.tags || []
      }

      if (editingTask) {
        await updateTask(editingTask.id, taskData)
      } else {
        await addTask(newTask.columnId, taskData)
      }

      setNewTask({ 
        title: '', 
        description: '', 
        moreInfo: '', 
        tags: [],
        columnId: null
      })
      setEditingTask(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      setError('Houve um erro ao salvar a tarefa. Tente novamente.')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description,
      moreInfo: task.moreInfo || '',
      tags: task.tags || [],
      columnId: task.columnId
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (taskId) => {
    setError(null)
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      setError('Houve um erro ao deletar a tarefa. Tente novamente.')
    }
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    
    // Validar tamanho máximo da tag
    if (newTagName.length > 20) {
      setError('O nome da tag não pode ter mais de 20 caracteres')
      return
    }

    try {
      await addTag(newTagName.trim(), selectedColor)
      setNewTagName('')
      setSelectedColor(tagColors[0])
      setShowTagInput(false)
      setError(null)
    } catch (error) {
      setError('Erro ao criar tag')
    }
  }

  const handleTagSelect = (tag) => {
    if (!newTask.tags.some(t => t.id === tag.id)) {
      setNewTask(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagId) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.id !== tagId)
    }))
  }

  const handleDeleteTag = async (tag) => {
    try {
      // Remove tag from all tasks
      const updatedTasks = tasks.map(task => ({
        ...task,
        tags: task.tags.filter(t => t.id !== tag.id)
      }))
      
      // Update tasks
      await Promise.all(updatedTasks.map(task => updateTask(task.id, task)))

      // Remove tag from tags list
      await deleteTag(tag.id)
      setTagToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
      setError('Houve um erro ao deletar a tag. Tente novamente.')
    }
  }

  const handleDragStart = (event) => {
    const { active } = event
    const activeId = active.id

    // Verifica se é uma coluna ou uma tarefa sendo arrastada
    const isColumn = columns.some(col => col.id === activeId)
    if (isColumn) {
      setDraggedColumnId(activeId)
      } else {
      setActiveId(activeId)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (draggedColumnId) {
      // Lógica para reordenar colunas
      if (over && active.id !== over.id) {
        const oldIndex = columns.findIndex(col => col.id === active.id)
        const newIndex = columns.findIndex(col => col.id === over.id)
        
        const newColumns = arrayMove(columns, oldIndex, newIndex)
        await reorderColumns(newColumns)
      }
      setDraggedColumnId(null)
    } else {
      // Lógica para reordenar tarefas
      setActiveId(null)

      if (!over) return

      const activeTask = tasks.find(t => t.id === active.id)
      if (!activeTask) return

      // Verifica se o over.id é um ID de área vazia ou de uma tarefa
      let targetColumnId
      if (typeof over.id === 'string' && over.id.includes('-empty')) {
        targetColumnId = over.id.split('-')[0]
      } else {
        const overTask = tasks.find(t => t.id === over.id)
        targetColumnId = overTask?.columnId
      }

      if (!targetColumnId) return

      if (activeTask.columnId !== targetColumnId) {
        // Mover para outra coluna
        const tasksInTargetColumn = tasks.filter(t => t.columnId === targetColumnId)
        const position = tasksInTargetColumn.length > 0
          ? Math.min(...tasksInTargetColumn.map(t => t.position)) - 1000
          : 1000
        await moveTask(activeTask.id, activeTask.columnId, targetColumnId, position)
      } else if (active.id !== over.id && !over.id.includes('-empty')) {
        // Reordenar na mesma coluna
        const overTask = tasks.find(t => t.id === over.id)
        if (!overTask) return

        const activeIndex = tasks
          .filter(t => t.columnId === activeTask.columnId)
          .findIndex(t => t.id === active.id)
        const overIndex = tasks
          .filter(t => t.columnId === overTask.columnId)
          .findIndex(t => t.id === over.id)

        const newPosition = overIndex > activeIndex
          ? overTask.position + 1000
          : overTask.position - 1000
        
        await moveTask(activeTask.id, activeTask.columnId, activeTask.columnId, newPosition)
      }
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return
    
    try {
      await addColumn(newColumnTitle.trim())
      setNewColumnTitle('')
    } catch (error) {
      setError('Erro ao adicionar coluna')
    }
  }

  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(columnId)
    } catch (error) {
      setError('Erro ao deletar coluna')
    }
  }

  const handleUpdateColumn = async (columnId, title) => {
    try {
      await updateColumn(columnId, { title })
      setEditingColumn(null)
    } catch (error) {
      setError('Erro ao atualizar coluna')
    }
  }

  // Filtra as tarefas baseado na busca e tags selecionadas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.moreInfo?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => task.tags?.some(t => t.id === tag.id))

    return matchesSearch && matchesTags
  })

  // Componente para o Dialog de leitura
  const ReadMoreDialog = ({ task, onClose }) => {
    if (!task) return null

    return (
      <Dialog open={!!task} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription>
                {task.description}
              </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {task.moreInfo && (
              <div className="text-sm space-y-2">
                <Label>Mais Informações</Label>
                <div className="prose prose-sm max-w-none">
                  {task.moreInfo.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1">
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onClose()}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Adiciona handler para navegação por teclado
  const handleKeyDown = (e) => {
    const container = boardRef.current
    if (!container) return

    if (e.key === 'ArrowLeft') {
      container.scrollBy({ left: -320, behavior: 'smooth' })
    } else if (e.key === 'ArrowRight') {
      container.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  if (!user) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">Faça login para ver suas tarefas</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quadro de Tarefas</h2>
          <p className="text-muted-foreground">
            Organize suas tarefas em colunas e arraste para reordenar
          </p>
        </div>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-muted/50"
              >
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="flex items-center border-b border-border p-2">
                <Search className="h-4 w-4 text-muted-foreground ml-2" />
                <Input
                  placeholder="Pesquisar tarefas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Tag className="h-4 w-4" />
                Gerenciar Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tags</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTagInput(prev => !prev)}
                    className="h-8 px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {showTagInput && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Nome da tag"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-8"
                      maxLength={20}
                    />
                    <div className="flex gap-1 flex-wrap">
                      {tagColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full",
                            selectedColor === color ? "ring-2 ring-offset-2 ring-ring" : ""
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowTagInput(false)
                          setNewTagName('')
                          setSelectedColor(tagColors[0])
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddTag}
                        disabled={!newTagName.trim()}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between group"
                    >
                      <Badge
                        variant="secondary"
                        style={{ backgroundColor: tag.color }}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.some(t => t.id === tag.id)
                              ? prev.filter(t => t.id !== tag.id)
                              : [...prev, tag]
                          )
                        }}
                      >
                        {tag.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setTagToDelete(tag)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground"></span>
          <div className="flex gap-2 items-center">
            {selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                style={{ 
                  backgroundColor: tag.color,
                  color: 'white'
                }}
              >
                {tag.name}
                <button
                  onClick={() => setSelectedTags(prev => prev.filter(t => t.id !== tag.id))}
                  className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Quadro Trello com navegação */}
      <div className="relative">
        <div
          ref={boardRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent select-none touch-pan-x"
          style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'none',
          }}
          onMouseDown={(e) => {
            if (
              e.target instanceof HTMLInputElement ||
              e.target instanceof HTMLButtonElement ||
              e.target.closest('.cursor-move')
            ) {
              return
            }

            const container = boardRef.current
            if (!container) return

            const startX = e.pageX - container.offsetLeft
            const scrollLeft = container.scrollLeft
            let isDragging = true

            const handleMouseMove = (e) => {
              if (!isDragging) return
              if (!container) return

              const x = e.pageX - container.offsetLeft
              const walk = (x - startX) * 2
              container.scrollLeft = scrollLeft - walk
            }

            const handleMouseUp = () => {
              isDragging = false
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
              document.removeEventListener('mouseleave', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.addEventListener('mouseleave', handleMouseUp)
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onEdit={(id, title, save) => {
                    if (save) {
                      handleUpdateColumn(id, title)
                    } else {
                      setEditingColumn(id)
                    }
                  }}
                  onDelete={handleDeleteColumn}
                  filteredTasks={filteredTasks}
                  setNewTask={setNewTask}
                  setIsDialogOpen={setIsDialogOpen}
                  handleEdit={handleEdit}
                />
              ))}
            </SortableContext>

            {/* Botão de adicionar coluna */}
            <div className="flex-shrink-0 w-80 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 transition-all duration-200 hover:bg-muted/30 hover:border-muted-foreground/30 group">
              <Dialog>
          <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors duration-200 hover:bg-transparent"
                  >
                    <Plus className="h-8 w-8 transition-transform duration-200 group-hover:scale-110" />
                    <span>Adicionar Coluna</span>
            </Button>
          </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Coluna</DialogTitle>
                    <DialogDescription>
                      Digite o nome da nova coluna abaixo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="columnTitle">Nome da Coluna</Label>
                      <Input
                        id="columnTitle"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Digite o nome da coluna"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        handleAddColumn()
                        document.querySelector('[role="dialog"]').querySelector('button[aria-label="Close"]').click()
                      }}
                      disabled={!newColumnTitle.trim()}
                    >
                      Criar Coluna
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <DragOverlay dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              scale: 1.05
            }}>
              {draggedColumnId ? (
                <div className="w-80 bg-muted/50 rounded-lg shadow-lg">
                  <div className="p-4 border-b border-muted">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {columns.find(c => c.id === draggedColumnId)?.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    {filteredTasks
                      .filter(task => task.columnId === draggedColumnId)
                      .map(task => (
                        <div key={task.id} className="mb-2">
                          <Card>
                            <CardHeader className="p-4">
                              <CardTitle className="text-base">{task.title}</CardTitle>
                              {task.description && (
                                <CardDescription>{task.description}</CardDescription>
                              )}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
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
                            </CardHeader>
                          </Card>
                        </div>
                      ))}
                  </div>
                </div>
              ) : activeId ? (
                <div className="shadow-lg">
                  <Card>
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {tasks.find(t => t.id === activeId)?.title}
                          </CardTitle>
                          <CardDescription>
                            {tasks.find(t => t.id === activeId)?.description}
                          </CardDescription>
                          {tasks.find(t => t.id === activeId)?.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tasks.find(t => t.id === activeId)?.tags.map((tag) => (
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
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Dialog para adicionar/editar tarefa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes da tarefa abaixo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Digite o título da tarefa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Digite a descrição da tarefa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moreInfo">Mais Informações</Label>
                  <textarea
                    id="moreInfo"
                    value={newTask.moreInfo}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        moreInfo: e.target.value,
                      }))
                    }
                    placeholder="Adicione informações adicionais sobre a tarefa"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {newTask.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1 rounded-full hover:bg-background/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer"
                        style={{ 
                          borderColor: tag.color,
                          color: tag.color,
                          backgroundColor: newTask.tags.some(t => t.id === tag.id) ? tag.color : 'transparent',
                        }}
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-red-500">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingTask ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* Dialog para confirmação de exclusão de tag */}
      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tag será removida de todas as tarefas que a utilizam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              onClick={() => handleDeleteTag(tagToDelete)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 

// Adicione estes estilos globais ao seu arquivo CSS global
const globalStyles = `
  /* Estilização da barra de rolagem */
  .scrollbar-thin::-webkit-scrollbar {
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted));
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground));
  }

  /* Esconder a barra de rolagem no Firefox */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted)) transparent;
  }
` 