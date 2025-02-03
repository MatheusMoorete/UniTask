import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Calendar, Plus, Tag, Bell, X, Loader2, Clock } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { CustomCalendar } from '../ui/custom-calendar'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
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
import { cn } from '../../lib/utils'

const PRIORITY_OPTIONS = [
  { value: 'P1', label: 'P1 - Alta' },
  { value: 'P2', label: 'P2 - Média' },
  { value: 'P3', label: 'P3 - Baixa' },
  { value: 'P4', label: 'P4 - Nenhuma' }
]

// Schema de validação
const taskSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().optional().nullable(),
  date: z.date({
    required_error: "A data de vencimento é obrigatória",
    invalid_type_error: "Data inválida"
  }),
  priority: z.enum(['P1', 'P2', 'P3', 'P4'], {
    required_error: "A prioridade é obrigatória",
    invalid_type_error: "Prioridade inválida"
  }),
  subtasks: z.array(
    z.object({
      title: z.string(),
      completed: z.boolean()
    })
  ).optional().default([]),
  location: z.string().optional().nullable(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().optional(),
      userId: z.string()
    })
  ).optional().default([]),
  addToCalendar: z.boolean().optional().default(false)
})

export function TaskDialog({ 
  isOpen, 
  onOpenChange,
  onSubmit,
  calendarEvents,
  onAddFromCalendar,
  tags = [],
  onTagCreate,
  onTagDelete,
  columnId
}) {
  const { user } = useAuth()
  const { isAuthenticated, handleAuth, createEvent, calendars } = useGoogleCalendar()
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [tagToDelete, setTagToDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTimeDialog, setShowTimeDialog] = useState(false)
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [taskDataToSubmit, setTaskDataToSubmit] = useState(null)

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      date: undefined,
      priority: undefined,
      subtasks: [],
      location: '',
      tags: [],
      addToCalendar: false
    }
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset({
        title: '',
        description: '',
        date: undefined,
        priority: undefined,
        subtasks: [],
        location: '',
        tags: [],
        addToCalendar: false
      })
    }
  }, [isOpen, reset])

  const handleCreateTag = useCallback(async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      queueMicrotask(() => toast.error('Digite um nome para a tag'))
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
      const currentTags = watch('tags')
      setValue('tags', [...currentTags, newTag])
      setNewTagName('')
      setShowTagInput(false)
      queueMicrotask(() => toast.success('Tag criada com sucesso'))
    } catch (error) {
      queueMicrotask(() => toast.error('Erro ao criar tag'))
      console.error('Error creating tag:', error)
    }
  }, [newTagName, onTagCreate, user?.uid, watch, setValue])

  const onSubmitForm = useCallback(async (data) => {
    if (!user?.uid) {
      queueMicrotask(() => toast.error('Usuário não autenticado'))
      return
    }

    if (data.addToCalendar) {
      setTaskDataToSubmit(data)
      setShowTimeDialog(true)
      return
    }
    
    try {
      setIsSubmitting(true)
      const cleanData = {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: data.date,
        priority: data.priority,
        subtasks: data.subtasks || [],
        location: data.location?.trim() || null,
        tags: data.tags || [],
        userId: user.uid,
        columnId: columnId || 'default',
        position: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await onSubmit(cleanData)
      onOpenChange(false)
      queueMicrotask(() => toast.success('Tarefa criada com sucesso'))
    } catch (error) {
      console.error('Error saving task:', error)
      queueMicrotask(() => toast.error('Erro ao salvar tarefa: ' + error.message))
    } finally {
      setIsSubmitting(false)
    }
  }, [user?.uid, onSubmit, onOpenChange])

  const handleTimeSubmit = async () => {
    if (!taskDataToSubmit) return

    try {
      setIsSubmitting(true)
      const cleanData = {
        title: taskDataToSubmit.title.trim(),
        description: taskDataToSubmit.description?.trim() || null,
        date: taskDataToSubmit.date,
        priority: taskDataToSubmit.priority,
        subtasks: taskDataToSubmit.subtasks || [],
        location: taskDataToSubmit.location?.trim() || null,
        tags: taskDataToSubmit.tags || [],
        userId: user.uid,
        columnId: columnId || 'default',
        position: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (isAuthenticated && calendars.length > 0) {
        try {
          // Criar uma data com o horário selecionado
          const [hours, minutes] = selectedTime.split(':')
          const startDate = new Date(taskDataToSubmit.date)
          startDate.setHours(parseInt(hours), parseInt(minutes), 0)
          
          const endDate = new Date(startDate)
          endDate.setHours(startDate.getHours() + 1) // Adiciona 1 hora para o fim do evento

          const eventData = {
            summary: cleanData.title,
            description: cleanData.description || '',
            location: cleanData.location || '',
            start: {
              dateTime: startDate.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: endDate.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }

          const calendarEvent = await createEvent(eventData, calendars[0].id)
          cleanData.calendarEventId = calendarEvent.id
        } catch (error) {
          console.error('Erro ao criar evento no calendário:', error)
          queueMicrotask(() => toast.error('Erro ao adicionar ao Google Calendar'))
          return
        }
      }
      
      await onSubmit(cleanData)
      setShowTimeDialog(false)
      onOpenChange(false)
      queueMicrotask(() => toast.success('Tarefa criada e sincronizada com o Google Calendar'))
    } catch (error) {
      console.error('Error saving task:', error)
      queueMicrotask(() => toast.error('Erro ao salvar tarefa: ' + error.message))
    } finally {
      setIsSubmitting(false)
      setTaskDataToSubmit(null)
    }
  }

  const handleTagSelect = (tag) => {
    const currentTags = watch('tags')
    const hasTag = currentTags.some(t => t.id === tag.id)
    setValue('tags', hasTag 
      ? currentTags.filter(t => t.id !== tag.id)
      : [...currentTags, tag]
    )
  }

  const handleAddSubtask = () => {
    const currentSubtasks = watch('subtasks')
    setValue('subtasks', [...currentSubtasks, { title: '', completed: false }])
  }

  const handleSubtaskChange = (index, value) => {
    const currentSubtasks = [...watch('subtasks')]
    currentSubtasks[index].title = value
    setValue('subtasks', currentSubtasks)
  }

  const handleRemoveSubtask = (index) => {
    const currentSubtasks = watch('subtasks')
    setValue('subtasks', currentSubtasks.filter((_, i) => i !== index))
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da nova tarefa
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit(onSubmitForm)} className="space-y-4">
            {/* Título */}
            <div>
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Digite o título da tarefa"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Subtarefas */}
            <div>
              <Label className="mb-2 block">Subtarefas</Label>
              <div className="space-y-2">
                {watch('subtasks').map((subtask, index) => (
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
                      className="h-8 w-8 flex-shrink-0"
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

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Digite uma descrição (opcional)"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Data e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Prazo <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('date') && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {watch('date') 
                        ? format(watch('date'), "dd/MM/yyyy", { locale: ptBR })
                        : "Selecione uma data"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CustomCalendar
                      selectedDate={watch('date')}
                      onDateSelect={(date) => setValue('date', date)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Prioridade <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('priority')}
                  onValueChange={(value) => setValue('priority', value)}
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
                {errors.priority && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.priority.message}
                  </p>
                )}
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
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={cn(
                        "cursor-pointer flex items-center gap-1",
                        watch('tags').some(t => t.id === tag.id) && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                      {watch('tags').some(t => t.id === tag.id) && (
                        <X 
                          className="h-3 w-3 hover:text-red-500"
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

            {/* Botões e Google Calendar */}
            <DialogFooter className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">
                  Adicionar tarefa ao Google Calendar
                </span>
                {isAuthenticated && (
                  <Switch
                    checked={watch('addToCalendar')}
                    onCheckedChange={(checked) => 
                      setValue('addToCalendar', checked)
                    }
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selecionar Horário</DialogTitle>
            <DialogDescription>
              Escolha o horário para o evento no Google Calendar
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Label htmlFor="time" className="block mb-2">
              Horário do evento
            </Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowTimeDialog(false)
                setTaskDataToSubmit(null)
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleTimeSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
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
    </>
  )
} 
