import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Calendar, Clock, MapPin, Tag, Bell, Plus, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import { Input } from '../ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Calendar as CalendarComponent } from '../ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useAuth } from '../../contexts/AuthContext'
import { CustomCalendar } from '../ui/custom-calendar'
import { Badge } from '../ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

const PRIORITY_OPTIONS = [
  { value: 'P1', label: 'P1 - Alta' },
  { value: 'P2', label: 'P2 - Média' },
  { value: 'P3', label: 'P3 - Baixa' },
  { value: 'P4', label: 'P4 - Nenhuma' }
]

// Função para converter para data válida
const toValidDate = (date) => {
  if (!date) return new Date()
  try {
    // Se já for uma instância de Date, retorna ela mesma
    if (date instanceof Date && !isNaN(date)) return date
    // Se for um timestamp do Firestore
    if (date?.toDate) return date.toDate()
    // Se for uma string ou número, tenta converter
    const parsed = new Date(date)
    return isNaN(parsed) ? new Date() : parsed
  } catch (error) {
    console.error('Error converting date:', error)
    return new Date()
  }
}

export function TaskCard({ 
  task,
  isOpen, 
  onOpenChange,
  onUpdate,
  onDelete,
  tags = [],
  onTagCreate,
  onTagDelete
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    priority: 'P2',
    subtasks: [],
    location: '',
    tags: [],
    userId: user?.uid,
  })
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [tagToDelete, setTagToDelete] = useState(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      try {
        setFormData({
          ...task,
          date: toValidDate(task.date),
          priority: task.priority || 'P2',
          subtasks: task.subtasks || [],
          location: task.location || '',
          tags: task.tags || [],
        })
      } catch (error) {
        console.error('Error setting form data:', error)
        setFormData({
          ...task,
          date: new Date(),
          priority: task.priority || 'P2',
          subtasks: task.subtasks || [],
          location: task.location || '',
          tags: task.tags || [],
        })
      }
    }
  }, [task])

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      setError('Digite um nome para a tag')
      return
    }
    try {
      const newTag = await onTagCreate({
        name: newTagName.trim(),
        color: '#1a73e8',
        userId: user?.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }))
      setNewTagName('')
      setShowTagInput(false)
      setError('')
    } catch (error) {
      setError('Erro ao criar tag')
      console.error('Error creating tag:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!user?.uid) {
      setError('Usuário não autenticado')
      return
    }
    
    if (!formData.title.trim()) {
      setError('O título é obrigatório')
      return
    }
    
    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        userId: user.uid,
        tags: formData.tags || [],
        updatedAt: new Date(),
        // Garantir que a data seja um objeto Date válido
        date: formData.date instanceof Date 
          ? formData.date 
          : formData.date?.toDate 
            ? formData.date.toDate() 
            : new Date(formData.date || new Date())
      }
      
      onUpdate(taskData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating task:', error)
      setError('Erro ao atualizar tarefa')
    }
  }

  const handleTagSelect = (tag) => {
    setFormData(prev => {
      const hasTag = prev.tags.some(t => t.id === tag.id)
      return {
        ...prev,
        tags: hasTag 
          ? prev.tags.filter(t => t.id !== tag.id)
          : [...prev.tags, tag]
      }
    })
  }

  const handleAddSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: '', completed: false }]
    }))
  }

  const handleSubtaskChange = (index, value) => {
    const newSubtasks = [...formData.subtasks]
    newSubtasks[index].title = value
    setFormData(prev => ({ ...prev, subtasks: newSubtasks }))
  }

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }))
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-md md:max-w-lg">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Edite os detalhes da tarefa
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título e Descrição */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título da tarefa"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Digite uma descrição (opcional)"
                  rows={2}
                  className="resize-none w-full"
                />
              </div>
            </div>

            {/* Data e Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Prazo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(toValidDate(formData.date), "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={toValidDate(formData.date)}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date: toValidDate(date) }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="location">Local</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Digite o local (opcional)"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition-colors",
                      formData.tags.some(t => t.id === tag.id)
                        ? "bg-primary/20 hover:bg-primary/30"
                        : "hover:bg-accent"
                    )}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag.name}
                    {formData.tags.some(t => t.id === tag.id) && (
                      <X
                        className="ml-1 h-3 w-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTagSelect(tag)
                        }}
                      />
                    )}
                  </Badge>
                ))}
                {showTagInput ? (
                  <form onSubmit={handleCreateTag} className="flex items-center gap-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Nome da tag"
                      className="h-7 w-32 text-sm"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => {
                        setShowTagInput(false)
                        setNewTagName('')
                      }}
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTagInput(true)}
                    className="h-7"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Tag
                  </Button>
                )}
              </div>
            </div>

            {/* Subtarefas */}
            <div>
              <Label>Subtarefas</Label>
              <div className="space-y-2 mt-2">
                {formData.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder="Digite a subtarefa"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtask(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSubtask}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Subtarefa
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteAlert(true)
                }}
                className="w-full sm:w-auto"
              >
                Excluir
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="max-w-[95vw] w-full sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(task.id)
                onOpenChange(false)
              }}
              className="w-full sm:w-auto"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 