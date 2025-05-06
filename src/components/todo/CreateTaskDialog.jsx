import { useState } from 'react'
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
import { Calendar, Plus, Tag, Bell, X, Loader2, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
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
  }).refine((date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return date >= today
  }, "A data não pode ser anterior a hoje"),
  time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido')
    .optional()
    .nullable()
    .or(z.literal(''))
    .refine((time, ctx) => {
      if (!time) return true // Se não houver hora definida, é válido
      
      const date = ctx.parent.date
      if (!date) return true // Se não houver data definida, validamos apenas o formato da hora
      
      const now = new Date()
      const [hours, minutes] = time.split(':').map(Number)
      const taskDateTime = new Date(date)
      taskDateTime.setHours(hours, minutes)
      
      // Se for hoje, verifica se a hora já passou
      if (date.getDate() === now.getDate() && 
          date.getMonth() === now.getMonth() && 
          date.getFullYear() === now.getFullYear()) {
        return taskDateTime > now
      }
      
      return true
    }, "O horário selecionado já passou"),
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
      title: z.string().optional(),
      completed: z.boolean().optional().default(false)
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
  // Função para verificar se a data/hora já passou
  const isDateTimePast = () => {
    const date = form.watch('date')
    const time = form.watch('time')
    
    if (!date) return false
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Se a data for anterior a hoje
    if (date < today) return true
    
    // Se for hoje e tiver horário definido
    if (time && 
        date.getDate() === now.getDate() && 
        date.getMonth() === now.getMonth() && 
        date.getFullYear() === now.getFullYear()) {
      const [hours, minutes] = time.split(':').map(Number)
      const taskDateTime = new Date(date)
      taskDateTime.setHours(hours, minutes)
      return taskDateTime <= now
    }
    
    return false
  }

  return (
    <div className="space-y-4">
      {/* Alerta de data/hora passada */}
      {isDateTimePast() && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Atenção! Você está criando uma tarefa para uma data/hora que já passou.
                {form.watch('time') 
                  ? ' Considere ajustar a data e o horário.'
                  : ' Considere ajustar a data.'}
              </p>
            </div>
          </div>
        </div>
      )}

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
  onTagCreate
}) {
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#1a73e8')

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!newTagName.trim()) {
      queueMicrotask(() => showToast.error('Digite um nome para a tag'))
      return
    }
    try {
      const newTag = await onTagCreate({
        name: newTagName.trim(),
        color: newTagColor
      })
      const currentTags = form.watch('tags')
      form.setValue('tags', [...currentTags, newTag])
      setNewTagName('')
      setShowCreateTagDialog(false)
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

  const handleRemoveTag = (id) => {
    const currentTags = form.watch('tags')
    form.setValue('tags', currentTags.filter(tag => tag.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Descreva os detalhes da tarefa"
          className="h-24"
        />
      </div>

      {/* Subtarefas */}
      <div>
        <Label>Subtarefas</Label>
        <div className="space-y-2 mt-2">
          {form.watch('subtasks')?.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={form.watch(`subtasks.${index}.title`) || ''}
                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                placeholder="Digite uma subtarefa"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
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
            className="w-full mt-2"
            onClick={handleAddSubtask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar subtarefa
          </Button>
        </div>
      </div>

      {/* Localização */}
      <div>
        <Label htmlFor="location">Localização</Label>
        <Input
          id="location"
          {...form.register('location')}
          placeholder="Onde a tarefa ocorrerá?"
        />
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Tags</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateTagDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova tag
          </Button>
        </div>

        {/* Lista de Tags Selecionadas */}
        {form.watch('tags')?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {form.watch('tags').map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 flex items-center gap-1"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color,
                  borderColor: tag.color ? `${tag.color}40` : undefined
                }}
              >
                {tag.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Seletor de Tags */}
        <Select
          value=""
          onValueChange={handleTagSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma tag" />
          </SelectTrigger>
          <SelectContent>
            {tags
              .filter(
                (tag) =>
                  !form.watch('tags')?.some((selectedTag) => selectedTag.id === tag.id)
              )
              .map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            {tags.length === 0 ||
              (tags.length > 0 &&
                tags.every((tag) =>
                  form.watch('tags')?.some((selectedTag) => selectedTag.id === tag.id)
                ) && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Nenhuma tag disponível
                  </div>
                ))}
          </SelectContent>
        </Select>
      </div>

      {/* Diálogo para criar uma nova tag */}
      <AlertDialog open={showCreateTagDialog} onOpenChange={setShowCreateTagDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nova Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Crie uma nova tag para organizar suas tarefas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="tag-name">Nome da Tag</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Digite o nome da tag"
              />
            </div>
            
            <div>
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TAG_COLORS.map((color) => (
                  <div
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2 transition-all",
                      newTagColor === color
                        ? "border-gray-900 scale-110"
                        : "border-transparent hover:border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateTag}>
              Criar Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Botões de navegação */}
      <DialogFooter className="flex justify-between !mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Tarefa"
          )}
        </Button>
      </DialogFooter>
    </div>
  )
}

// Componente principal
export function CreateTaskDialog({ 
  isOpen, 
  onOpenChange,
  onSubmit,
  tags = [],
  onTagCreate,
  onTagDelete,
  columnId
}) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Formulário da primeira etapa
  const stepOneForm = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      time: '',
      priority: 'P3'
    }
  })

  // Formulário da segunda etapa
  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      description: '',
      subtasks: [],
      location: '',
      tags: []
    }
  })

  const handleNext = () => {
    const isValid = stepOneForm.formState.isValid
    if (isValid) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  // Função para finalizar a submissão
  const handleSubmitForms = async () => {
    setIsSubmitting(true)
    try {
      // Validar ambos os formulários
      await stepOneForm.trigger()
      await stepTwoForm.trigger()
      
      if (!stepOneForm.formState.isValid) {
        setStep(1)
        setIsSubmitting(false)
        return
      }
      
      if (!stepTwoForm.formState.isValid) {
        setIsSubmitting(false)
        return
      }
      
      // Combinar os dados de ambos os formulários
      const date = stepOneForm.getValues('date')
      const time = stepOneForm.getValues('time')
      
      let taskDateTime = date
      
      // Se houver hora, definir no objeto Date
      if (time) {
        const [hours, minutes] = time.split(':').map(Number)
        taskDateTime = new Date(date.setHours(hours, minutes, 0, 0))
      } else {
        // Se não houver hora, definir para 23:59:59
        taskDateTime = new Date(date.setHours(23, 59, 59, 999))
      }
      
      // Dados finais da tarefa
      const taskData = {
        title: stepOneForm.getValues('title'),
        dueDate: taskDateTime,
        hasTime: !!time,
        priority: stepOneForm.getValues('priority'),
        description: stepTwoForm.getValues('description') || '',
        subtasks: stepTwoForm.getValues('subtasks')?.filter(sub => sub.title) || [],
        location: stepTwoForm.getValues('location') || '',
        tags: stepTwoForm.getValues('tags') || [],
        completed: false,
        createdAt: new Date(),
        userId: user.uid,
        // Se houver um columnId (Kanban), adicionar ao objeto
        ...(columnId && { columnId })
      }
      
      // Chamar função de submissão e receber o ID da tarefa criada
      const taskId = await onSubmit(taskData)
      
      // Limpar formulário após submissão
      stepOneForm.reset({
        title: '',
        date: new Date(),
        time: '',
        priority: 'P3'
      })
      
      stepTwoForm.reset({
        description: '',
        subtasks: [],
        location: '',
        tags: []
      })
      
      // Fechar modal e mostrar mensagem de sucesso
      setStep(1)
      onOpenChange(false)
      showToast.success('Tarefa criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      showToast.error('Erro ao criar tarefa')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setStep(1)
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Nova Tarefa - Informações Básicas' : 'Nova Tarefa - Detalhes Adicionais'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Adicione as informações básicas da sua tarefa.'
              : 'Adicione detalhes complementares para sua tarefa.'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
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
          />
        )}
      </DialogContent>
    </Dialog>
  )
} 