import { useState, useEffect, useCallback } from 'react'
import { format, addDays, subDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, MapPin, ChevronDown, GripVertical, Filter, Search } from 'lucide-react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { CreateTaskDialog } from './CreateTaskDialog'
import { EditTaskDialog } from './EditTaskDialog'
import { CustomCalendar } from '../ui/custom-calendar'
import { db } from '../../lib/firebase'
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, doc } from 'firebase/firestore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { cn } from "../../lib/utils"
import { useAuth } from '../../contexts/AuthContext'
import { Calendar } from 'lucide-react'
import { Badge } from '../ui/badge'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable, useDraggable } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { showToast } from '../../lib/toast'
import PropTypes from 'prop-types'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "../ui/dropdown-menu"
import { useLocalStorage } from '../../hooks/useLocalStorage'

// Animação para os elementos da página
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
}

// Definição dos PropTypes para task
const TaskPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.object]),
  priority: PropTypes.string,
  completed: PropTypes.bool,
  subtasks: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    completed: PropTypes.bool
  })),
  tags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    color: PropTypes.string
  })),
  location: PropTypes.string
})

// Componente para o item arrastável
function DraggableTaskItem({ task, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', task }
  })

  return (
    <div
      className={cn(
        "relative group",
        isDragging && "opacity-50"
      )}
    >
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 h-full flex items-center px-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}

DraggableTaskItem.propTypes = {
  task: TaskPropType.isRequired,
  children: PropTypes.node.isRequired
}

// Componente para a área de soltar
function DroppableDay({ date, children, isOver }) {
  const { setNodeRef } = useDroppable({
    id: date.toISOString(),
    data: { type: 'day', date }
  })

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "h-full transition-colors duration-200",
        isOver && "bg-accent/30 rounded-xl"
      )}
    >
      {children}
    </div>
  )
}

DroppableDay.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  children: PropTypes.node.isRequired,
  isOver: PropTypes.bool
}

function TodoList() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [tags, setTags] = useState([])
  const [tasks, setTasks] = useState([])
  const defaultColumnId = 'todo'
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [activeDragTask, setActiveDragTask] = useState(null)
  const [dragOverDay, setDragOverDay] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState([])
  const [showCompleted, setShowCompleted] = useLocalStorage('showCompleted', true)
  
  // Configurar sensores do DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  // Carregar tarefas e tags do usuário
  useEffect(() => {
    if (user?.uid) {
      const loadUserData = async () => {
        try {
          // Carregar tags
          const tagsQuery = query(collection(db, 'tags'), where('userId', '==', user.uid))
          const tagsSnapshot = await getDocs(tagsQuery)
          const userTags = tagsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setTags(userTags || [])

          // Carregar tarefas
          const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid))
          const tasksSnapshot = await getDocs(tasksQuery)
          const userTasks = tasksSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              date: toValidDate(data.date),
              tags: data.tags || [],
              isExpanded: false
            }
          })
          setTasks(userTasks || [])
        } catch (error) {
          console.error('Error loading user data:', error)
          setTags([])
          setTasks([])
        }
      }

      loadUserData()
    }
  }, [user])

  const handleAddTask = async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        userId: user?.uid,
        defaultColumnId: 'todo',
        position: tasks?.length || 0,
        updatedAt: new Date(),
        isExpanded: false,
        date: toValidDate(taskData.date || selectedDate),
        tags: taskData.tags || []
      }

      if (selectedTask) {
        const taskRef = doc(db, 'tasks', selectedTask.id)
        await updateDoc(taskRef, newTask)
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...newTask, id: selectedTask.id } : t))
      } else {
        const docRef = await addDoc(collection(db, 'tasks'), newTask)
        const addedTask = { ...newTask, id: docRef.id }
        setTasks([...tasks, addedTask])
      }
      setSelectedTask(null)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await deleteDoc(taskRef)
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleAddTag = async (tagData) => {
    try {
      const newTag = {
        ...tagData,
        userId: user?.uid,
      }
      const docRef = await addDoc(collection(db, 'tags'), newTag)
      const addedTag = { ...newTag, id: docRef.id }
      setTags(prev => [...prev, addedTag])
      return addedTag
    } catch (error) {
      console.error('Error adding tag:', error)
      throw error
    }
  }

  const handleDeleteTag = async (tagId) => {
    try {
      const tagRef = doc(db, 'tags', tagId)
      await deleteDoc(tagRef)
      setTags(prev => prev.filter(tag => tag.id !== tagId))
      
      // Remover a tag de todas as tarefas que a possuem
      const updatedTasks = tasks.map(task => ({
        ...task,
        tags: (task.tags || []).filter(t => t.id !== tagId)
      }))
      
      // Atualizar cada tarefa que tinha a tag
      await Promise.all(
        updatedTasks
          .filter(task => (task.tags || []).length !== (tasks.find(t => t.id === task.id)?.tags || []).length)
          .map(async (task) => {
            const taskRef = doc(db, 'tasks', task.id)
            await updateDoc(taskRef, task)
          })
      )
      
      setTasks(updatedTasks)
    } catch (error) {
      console.error('Error deleting tag:', error)
      throw error
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      
      // Se a tarefa foi marcada como completa, dispara o efeito de confete
      if (!taskToUpdate.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
        });
      }

      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !taskToUpdate.completed
      });

      setTasks(tasks.map((task) => 
        task.id === taskId ? updatedTask : task
      ));

    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      if (!updatedTask?.id) return

      const taskToUpdate = {
        ...updatedTask,
        date: toValidDate(updatedTask.date),
        updatedAt: new Date()
      }

      const taskRef = doc(db, 'tasks', updatedTask.id)
      await updateDoc(taskRef, taskToUpdate)
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? taskToUpdate : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsEditDialogOpen(true)
    setIsCreateDialogOpen(false)
  }

  const handleNewTask = () => {
    setSelectedTask(null)
    setIsCreateDialogOpen(true)
    setIsEditDialogOpen(false)
  }

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1))
  }

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  // Gera os dias da semana a partir do domingo
  const weekDays = selectedDate ? Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startOfWeek(selectedDate), index)
    return {
      date,
      dayNameShort: format(date, 'E', { locale: ptBR }).slice(0, 3),
      dayNameLong: format(date, 'EEEE', { locale: ptBR }),
      dayNumber: format(date, 'd'),
      isSelected: format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    }
  }) : []

  // Função para verificar se uma data é do mesmo dia
  const isSameDay = (date1, date2) => {
    try {
      if (!date1 || !date2) return false
      
      // Converter para objeto Date se for timestamp do Firestore
      const d1 = date1 instanceof Date ? date1 : date1.toDate ? date1.toDate() : new Date(date1)
      const d2 = date2 instanceof Date ? date2 : date2.toDate ? date2.toDate() : new Date(date2)
      
      return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd')
    } catch (error) {
      console.error('Error comparing dates:', error)
      return false
    }
  }

  // Função para obter a cor da prioridade
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1':
        return 'bg-red-100 text-red-700'
      case 'P2':
        return 'bg-yellow-100 text-yellow-700'
      case 'P3':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Função para obter a cor do hover baseado na prioridade
  const getHoverColor = (priority) => {
    switch (priority) {
      case 'P1':
        return 'hover:bg-red-50'
      case 'P2':
        return 'hover:bg-yellow-50'
      case 'P3':
        return 'hover:bg-green-50'
      default:
        return 'hover:bg-accent/50'
    }
  }

  // Função para alternar expansão do card
  const toggleCardExpansion = (taskId, e) => {
    e.stopPropagation()
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // Função para lidar com o início do drag
  const handleDragStart = (event) => {
    const { active } = event
    const draggedTask = tasks.find(task => task.id === active.id)
    setActiveDragTask(draggedTask)
  }

  // Função para lidar com o fim do drag
  const handleDragEnd = async (event) => {
    const { active, over } = event
    setDragOverDay(null)
    
    if (!over) {
      setActiveDragTask(null)
      return
    }

    try {
      const taskToMove = tasks.find(task => task.id === active.id)
      if (!taskToMove) return

      const targetDate = new Date(over.id)
      
      // Se a data for a mesma, não faz nada
      if (isSameDay(taskToMove.date, targetDate)) {
        setActiveDragTask(null)
        return
      }

      const updatedTask = {
        ...taskToMove,
        date: targetDate,
        updatedAt: new Date()
      }

      const taskRef = doc(db, 'tasks', taskToMove.id)
      await updateDoc(taskRef, updatedTask)
      
      setTasks(tasks.map(task => 
        task.id === taskToMove.id ? updatedTask : task
      ))

      // Mostrar feedback visual
      showToast.success('Tarefa movida com sucesso!')
    } catch (error) {
      console.error('Erro ao mover tarefa:', error)
      showToast.error('Erro ao mover tarefa')
    }

    setActiveDragTask(null)
  }

  // Função para lidar com o drag over
  const handleDragOver = (event) => {
    const { over } = event
    setDragOverDay(over ? over.id : null)
  }

  // Função para filtrar tarefas com base nos filtros atuais
  const filteredTasks = useCallback(() => {
    return tasks.filter(task => {
      // Filtro por data
      if (!isSameDay(task.date, selectedDate)) return false
      
      // Filtro por coluna
      if (task.defaultColumnId !== defaultColumnId) return false
      
      // Filtro de pesquisa
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        // Verifica também na descrição
        if (!task.description || !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
      }
      
      // Filtro por prioridade
      if (filterPriority.length > 0 && !filterPriority.includes(task.priority)) {
        return false
      }
      
      // Filtro de tarefas concluídas
      if (!showCompleted && task.completed) {
        return false
      }
      
      return true
    }).sort((a, b) => {
      // Ordenação: primeiro não concluídas, depois por prioridade (P1 > P2 > P3), depois por data de atualização
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      
      const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 }
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }, [tasks, selectedDate, defaultColumnId, searchQuery, filterPriority, showCompleted, isSameDay])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      modifiers={[restrictToWindowEdges]}
    >
      <motion.div 
        className="h-full p-4 md:p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          variants={itemVariants}
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tarefas
            </h2>
            <p className="text-muted-foreground mt-1">
              Organize suas atividades e acompanhe seus prazos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleToday}
            >
              Hoje
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto min-w-[120px]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <CustomCalendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleNewTask}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </motion.div>

        {/* Week Days */}
        <motion.div 
          className="grid grid-cols-7 gap-2 mb-6 relative z-10"
          variants={itemVariants}
        >
          {weekDays.map(({ date, dayNameShort, dayNameLong, dayNumber, isSelected, isToday }) => {
            const tasksCount = tasks.filter(task => 
              task.defaultColumnId === defaultColumnId && 
              !task.completed && 
              isSameDay(task.date, date)
            ).length

            const isOverDay = dragOverDay === date.toISOString()

            return (
              <DroppableDay 
                key={date.toString()} 
                date={date}
                isOver={isOverDay}
              >
                <div
                  className={cn(
                    "group relative flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 min-h-[80px]",
                    "hover:bg-accent/20",
                    isSelected ? "text-blue-600" : "text-muted-foreground",
                    isToday && !isSelected && "text-blue-500",
                    isOverDay && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setSelectedDate(date)}
                  role="button"
                  aria-label={`Selecionar ${dayNameLong}, ${dayNumber}`}
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedDate(date)
                    }
                  }}
                >
                  <span className="text-[0.65rem] sm:text-xs font-medium mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="sm:hidden">{dayNameShort}</span>
                    <span className="hidden sm:inline">{dayNameLong}</span>
                  </span>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 text-sm rounded-full transition-all relative",
                    "group-hover:bg-blue-50/50",
                    isSelected && "bg-blue-600 text-white font-medium group-hover:bg-blue-600",
                    isToday && !isSelected && "bg-blue-100/50 group-hover:bg-blue-100"
                  )}>
                    {dayNumber}
                    {tasksCount > 0 && (
                      <span className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full",
                        isSelected ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                      )}>
                        {tasksCount}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                  )}
                </div>
              </DroppableDay>
            )
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-4"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar tarefas" 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar tarefas"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => {
                    setSearchQuery('')
                    setFilterPriority([])
                    setShowCompleted(true)
                  }}>
                    Limpar filtros
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={showCompleted}
                    onCheckedChange={setShowCompleted}
                  >
                    Mostrar concluídas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm font-semibold">Prioridade</div>
                  {['P1', 'P2', 'P3', 'P4'].map(priority => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={filterPriority.includes(priority) || filterPriority.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterPriority(prev => 
                            prev.includes(priority) ? prev : [...prev, priority]
                          )
                        } else {
                          setFilterPriority(prev => prev.filter(p => p !== priority))
                        }
                      }}
                    >
                      <span className={cn(
                        "inline-block w-2 h-2 rounded-full mr-2",
                        priority === 'P1' && "bg-red-500",
                        priority === 'P2' && "bg-yellow-500",
                        priority === 'P3' && "bg-green-500",
                        priority === 'P4' && "bg-gray-500"
                      )}></span>
                      {priority}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        <motion.div 
          className="w-full max-w-full sm:max-w-[90%] mx-auto space-y-2 mt-4 relative z-0"
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              {filteredTasks().length === 0 ? (
                <motion.div 
                  className="text-center p-8 border rounded-lg bg-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-muted-foreground">
                    {searchQuery || filterPriority.length > 0 
                      ? 'Nenhuma tarefa corresponde aos filtros aplicados.'
                      : `Nenhuma tarefa para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}.`}
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleNewTask}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tarefa
                  </Button>
                </motion.div>
              ) : (
                filteredTasks().map(task => (
                  <DraggableTaskItem key={task.id} task={task}>
                    <div
                      className={cn(
                        "group flex items-start gap-3 p-3 pl-7 rounded-lg transition-colors border border-border/50",
                        "shadow-sm hover:shadow-md",
                        getHoverColor(task.priority),
                        task.completed && "opacity-50"
                      )}
                      onClick={() => handleTaskClick(task)}
                      role="button"
                      aria-label={`Tarefa: ${task.title}${task.completed ? ', concluída' : ''}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleTaskClick(task)
                        }
                      }}
                    >
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                        aria-label={`Marcar tarefa ${task.title} como ${task.completed ? 'não concluída' : 'concluída'}`}
                      />
                      <div className="flex-1 min-w-0">
                        {/* Cabeçalho do Card */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={cn(
                              "font-medium leading-none",
                              task.completed && "line-through"
                            )}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                getPriorityColor(task.priority)
                              )}>
                                {task.priority}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(toValidDate(task.date), "dd/MM/yyyy", { locale: ptBR })}
                                  {task.date instanceof Date && task.date.getHours() !== 0 && (
                                    <> • {format(task.date, "HH:mm")}</>
                                  )}
                                </span>
                              </div>
                            </div>
                            {task.location && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{task.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botão de Expandir Subtarefas */}
                        {task.subtasks?.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleCardExpansion(task.id, e)}
                            className="flex items-center gap-2 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            aria-expanded={expandedCards.has(task.id)}
                            aria-controls={`subtasks-${task.id}`}
                          >
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                expandedCards.has(task.id) && "rotate-180"
                              )}
                            />
                            <span>{task.subtasks.length} subtarefa{task.subtasks.length !== 1 ? 's' : ''}</span>
                          </button>
                        )}

                        {/* Subtarefas */}
                        {task.subtasks?.length > 0 && expandedCards.has(task.id) && (
                          <div 
                            id={`subtasks-${task.id}`}
                            className="mt-2 space-y-1.5 pl-4 border-l-2 border-accent"
                          >
                            {task.subtasks.map((subtask, index) => (
                              <div 
                                key={index}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  id={`subtask-${task.id}-${index}`}
                                  checked={subtask.completed}
                                  onCheckedChange={() => {
                                    const newSubtasks = [...task.subtasks]
                                    newSubtasks[index].completed = !newSubtasks[index].completed
                                    handleTaskUpdate({
                                      ...task,
                                      subtasks: newSubtasks
                                    })
                                  }}
                                  className="h-3.5 w-3.5"
                                  aria-label={`Marcar subtarefa ${subtask.title} como ${subtask.completed ? 'não concluída' : 'concluída'}`}
                                />
                                <label 
                                  htmlFor={`subtask-${task.id}-${index}`}
                                  className={cn(
                                    "text-sm cursor-pointer",
                                    subtask.completed && "line-through"
                                  )}
                                >
                                  {subtask.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map(tag => (
                              <Badge
                                key={tag.id}
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: tag.color + '20', color: tag.color }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DraggableTaskItem>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Task Dialogs */}
        <CreateTaskDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) setSelectedTask(null)
          }}
          onSubmit={handleAddTask}
          tags={tags}
          onTagCreate={handleAddTag}
          onTagDelete={handleDeleteTag}
          columnId={defaultColumnId}
        />

        <EditTaskDialog
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setSelectedTask(null)
          }}
          onSubmit={handleTaskUpdate}
          task={selectedTask}
          tags={tags}
          onTagCreate={handleAddTag}
          onTagDelete={handleDeleteTag}
          onDelete={handleDeleteTask}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragTask && (
            <div
              className={cn(
                "flex items-start gap-3 p-3 pl-7 rounded-lg border border-border/50",
                "cursor-grabbing shadow-lg max-w-[300px]",
                getHoverColor(activeDragTask.priority),
                "opacity-90 scale-105"
              )}
            >
              <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Checkbox
                checked={activeDragTask.completed}
                className="mt-1 pointer-events-none"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium leading-none truncate">
                  {activeDragTask.title}
                </h3>
                {activeDragTask.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {activeDragTask.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </DragOverlay>
      </motion.div>
    </DndContext>
  )
}

TodoList.displayName = 'TodoList'

export default TodoList