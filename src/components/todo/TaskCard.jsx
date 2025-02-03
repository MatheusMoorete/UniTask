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
        // Converter a data do Firestore para objeto Date
        const taskDate = task.date instanceof Date 
          ? task.date 
          : task.date?.toDate 
            ? task.date.toDate() 
            : new Date(task.date || new Date())

        setFormData({
          ...task,
          date: taskDate,
          priority: task.priority || 'P2',
          subtasks: task.subtasks || [],
          location: task.location || '',
          tags: task.tags || [],
        })
      } catch (error) {
        console.error('Error setting form data:', error)
        // Usar data atual como fallback
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
        <DialogContent className="max-w-md">
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
                  className="resize-none"
                />
              </div>
            </div>

            {/* Data e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prazo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(formData.date, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      selectedDate={formData.date}
                      onDateSelect={(date) => setFormData(prev => ({ ...prev, date }))}
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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

            {/* Subtarefas */}
            <div>
              <Label className="mb-2 block">Subtarefas</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formData.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                      placeholder="Digite a subtarefa"
                      className="h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveSubtask(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddSubtask}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar subtarefa
                </Button>
              </div>
            </div>

            {/* Etiquetas */}
            <div>
              <Label className="mb-2 block">Etiquetas</Label>
              {showTagInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nome da nova tag"
                    className="flex-1 h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8"
                    onClick={handleCreateTag}
                  >
                    Criar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setShowTagInput(false)
                      setNewTagName('')
                      setError('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowTagInput(true)}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Adicionar etiquetas
                </Button>
              )}
              {error && (
                <p className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={`cursor-pointer text-xs ${
                        formData.tags.some(t => t.id === tag.id) 
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                      {formData.tags.some(t => t.id === tag.id) && (
                        <X 
                          className="h-3 w-3 ml-1 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTagToDelete(tag)
                          }}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </div>


            {/* Botões */}
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={!!tagToDelete} 
        onOpenChange={() => setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover etiqueta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta etiqueta da tarefa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                handleTagSelect(tagToDelete)
                setTagToDelete(null)
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={showDeleteAlert} 
        onOpenChange={setShowDeleteAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(task.id)
                setShowDeleteAlert(false)
                onOpenChange(false)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 