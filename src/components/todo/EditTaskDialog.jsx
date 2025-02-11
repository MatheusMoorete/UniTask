import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { showToast } from '../../lib/toast'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Calendar, Plus, Tag, Bell, X, Loader2, Clock, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react'
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

// Schema de validação para a primeira etapa
const stepOneSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  date: z.date({
    required_error: "A data de vencimento é obrigatória",
    invalid_type_error: "Data inválida"
  }),
  time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido')
    .optional()
    .nullable()
    .or(z.literal('')),
  priority: z.enum(['P1', 'P2', 'P3', 'P4'], {
    required_error: "A prioridade é obrigatória",
    invalid_type_error: "Prioridade inválida"
  })
})

// Schema de validação para a segunda etapa
const stepTwoSchema = z.object({
  description: z.string().optional().nullable(),
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
  ).optional().default([])
})

// Componente para a primeira etapa
function StepOne({ form, onNext }) {
  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <Label htmlFor="title">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="Digite o título da tarefa"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      {/* Data e Horário */}
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
                  !form.watch('date') && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {form.watch('date') 
                  ? format(form.watch('date'), "dd/MM/yyyy", { locale: ptBR })
                  : "Selecione uma data"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CustomCalendar
                selectedDate={form.watch('date')}
                onDateSelect={(date) => form.setValue('date', date)}
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.date && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="time">Horário</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              id="time"
              type="time"
              {...form.register('time')}
              className="flex-1"
            />
          </div>
          {form.formState.errors.time && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.time.message}
            </p>
          )}
        </div>
      </div>

      {/* Prioridade */}
      <div>
        <Label>
          Prioridade <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.watch('priority')}
          onValueChange={(value) => form.setValue('priority', value)}
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
        {form.formState.errors.priority && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.priority.message}
          </p>
        )}
      </div>

      {/* Botões */}
      <DialogFooter>
        <Button
          type="button"
          onClick={onNext}
          disabled={!form.formState.isValid}
        >
          Próximo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </div>
  )
}

// Componente para a segunda etapa
function StepTwo({ 
  form, 
  onBack,
  onSubmit,
  isSubmitting,
  tags,
  onTagCreate,
  showDeleteAlert,
  setShowDeleteAlert
}) {
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      queueMicrotask(() => showToast.error('Digite um nome para a tag'))
      return
    }
    try {
      const newTag = await onTagCreate({
        name: newTagName.trim(),
        color: '#1a73e8'
      })
      const currentTags = form.watch('tags')
      form.setValue('tags', [...currentTags, newTag])
      setNewTagName('')
      setShowTagInput(false)
      queueMicrotask(() => showToast.success('Tag criada com sucesso'))
    } catch (error) {
      queueMicrotask(() => showToast.error('Erro ao criar tag'))
      console.error('Error creating tag:', error)
    }
  }

  const handleTagSelect = (tag) => {
    const currentTags = form.watch('tags')
    const hasTag = currentTags.some(t => t.id === tag.id)
    form.setValue('tags', hasTag 
      ? currentTags.filter(t => t.id !== tag.id)
      : [...currentTags, tag]
    )
  }

  const handleAddSubtask = () => {
    const currentSubtasks = form.watch('subtasks')
    form.setValue('subtasks', [...currentSubtasks, { title: '', completed: false }])
  }

  const handleSubtaskChange = (index, value) => {
    const currentSubtasks = [...form.watch('subtasks')]
    currentSubtasks[index].title = value
    form.setValue('subtasks', currentSubtasks)
  }

  const handleRemoveSubtask = (index) => {
    const currentSubtasks = form.watch('subtasks')
    form.setValue('subtasks', currentSubtasks.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Subtarefas */}
      <div>
        <Label className="mb-1 block">
          Subtarefas <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <div className="space-y-1.5">
          <div className="min-h-[80px] max-h-[100px] overflow-y-auto pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/20">
            {form.watch('subtasks').map((subtask, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Input
                  value={subtask.title}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  placeholder="Digite a subtarefa"
                  className="h-7"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={handleAddSubtask}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Adicionar subtarefa
          </Button>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="description" className="mb-1 block">
          Descrição <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Digite uma descrição (opcional)"
          rows={2}
          className="resize-none min-h-[60px]"
        />
      </div>

      {/* Etiquetas */}
      <div>
        <Label className="mb-1 block">
          Etiquetas <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        {showTagInput ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nome da nova tag"
              className="flex-1 h-7"
            />
            <Button
              type="button"
              size="sm"
              className="h-7"
              onClick={handleCreateTag}
            >
              Criar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7"
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
            className="w-full h-7 text-xs"
            onClick={() => setShowTagInput(true)}
          >
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            Adicionar etiquetas
          </Button>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className={cn(
                  "cursor-pointer flex items-center gap-1 text-xs py-0.5 h-5",
                  form.watch('tags').some(t => t.id === tag.id) && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleTagSelect(tag)}
              >
                {tag.name}
                {form.watch('tags').some(t => t.id === tag.id) && (
                  <X 
                    className="h-3 w-3 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTagSelect(tag)
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Localização */}
      <div>
        <Label htmlFor="location" className="mb-1 block">
          Localização <span className="text-xs text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="location"
          {...form.register('location')}
          placeholder="Digite a localização (opcional)"
          className="h-7"
        />
      </div>

      {/* Botões */}
      <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setShowDeleteAlert(true)
            }}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Button 
          type="button"
          onClick={onSubmit}
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </DialogFooter>
    </div>
  )
}

export function EditTaskDialog({ 
  isOpen, 
  onOpenChange,
  onSubmit,
  task,
  tags = [],
  onTagCreate,
  onTagDelete,
  onDelete
}) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  // Form para a primeira etapa
  const stepOneForm = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      title: task?.title || '',
      date: task?.date || new Date(),
      time: task?.date ? format(task.date, 'HH:mm') : '',
      priority: task?.priority || 'P2'
    }
  })

  // Form para a segunda etapa
  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      description: task?.description || '',
      subtasks: task?.subtasks || [],
      location: task?.location || '',
      tags: task?.tags || []
    }
  })

  // Reset forms when dialog closes or task changes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      stepOneForm.reset()
      stepTwoForm.reset()
    } else if (task) {
      stepOneForm.reset({
        title: task.title,
        date: task.date,
        time: task.date ? format(task.date, 'HH:mm') : '',
        priority: task.priority
      })
      stepTwoForm.reset({
        description: task.description,
        subtasks: task.subtasks || [],
        location: task.location,
        tags: task.tags || []
      })
    }
  }, [isOpen, task])

  const handleNext = () => {
    const isValid = stepOneForm.formState.isValid
    if (isValid) {
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(1)
  }

  const handleSubmitForms = async () => {
    if (!user?.uid) {
      queueMicrotask(() => showToast.error('Usuário não autenticado'))
      return
    }
    
    try {
      setIsSubmitting(true)

      // Combinar dados dos dois formulários
      const stepOneData = stepOneForm.getValues()
      const stepTwoData = stepTwoForm.getValues()

      // Criar data com horário
      const taskDate = new Date(stepOneData.date)
      if (stepOneData.time) {
        const [hours, minutes] = stepOneData.time.split(':')
        taskDate.setHours(parseInt(hours), parseInt(minutes), 0)
      } else {
        taskDate.setHours(0, 0, 0)
      }

      const taskData = {
        ...task,
        title: stepOneData.title.trim(),
        date: taskDate,
        priority: stepOneData.priority,
        description: stepTwoData.description?.trim() || null,
        subtasks: stepTwoData.subtasks || [],
        location: stepTwoData.location?.trim() || null,
        tags: stepTwoData.tags || [],
        userId: user.uid,
        updatedAt: new Date()
      }
      
      await onSubmit(taskData)
      onOpenChange(false)
      queueMicrotask(() => showToast.success('Tarefa atualizada com sucesso'))
    } catch (error) {
      console.error('Error updating task:', error)
      queueMicrotask(() => showToast.error('Erro ao atualizar tarefa: ' + error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              {currentStep === 1 
                ? 'Edite as informações básicas da tarefa'
                : 'Edite os detalhes adicionais da tarefa'
              }
            </DialogDescription>
          </DialogHeader>

          {currentStep === 1 ? (
            <StepOne 
              form={stepOneForm} 
              onNext={handleNext} 
            />
          ) : (
            <StepTwo 
              form={stepTwoForm}
              onBack={handleBack}
              onSubmit={handleSubmitForms}
              isSubmitting={isSubmitting}
              tags={tags}
              onTagCreate={onTagCreate}
              showDeleteAlert={showDeleteAlert}
              setShowDeleteAlert={setShowDeleteAlert}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog 
        open={showDeleteAlert} 
        onOpenChange={(open) => {
          setShowDeleteAlert(open)
        }}
      >
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
              variant="destructive"
              onClick={() => {
                if (task?.id) {
                  onDelete(task.id)
                  setShowDeleteAlert(false)
                  onOpenChange(false)
                  queueMicrotask(() => showToast.success('Tarefa excluída com sucesso'))
                } else {
                  showToast.error('Erro ao excluir: ID da tarefa não encontrado')
                }
              }}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 