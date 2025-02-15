import { useState, useEffect } from 'react'
import { format, addDays, subDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, MapPin, ChevronDown } from 'lucide-react'
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
import { motion } from 'framer-motion'

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

  return (
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
        className="grid grid-cols-7 gap-2 mb-6"
        variants={itemVariants}
      >
        {weekDays.map(({ date, dayNameShort, dayNameLong, dayNumber, isSelected, isToday }) => (
          <button
            key={date.toString()}
            onClick={() => setSelectedDate(date)}
            className={cn(
              "group relative flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200",
              "hover:bg-transparent",
              isSelected ? "text-blue-600" : "text-muted-foreground",
              isToday && !isSelected && "text-blue-500"
            )}
          >
            <span className="text-[0.65rem] sm:text-xs font-medium mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="sm:hidden">{dayNameShort}</span>
              <span className="hidden sm:inline">{dayNameLong}</span>
            </span>
            <span className={cn(
              "flex items-center justify-center w-8 h-8 text-sm rounded-full transition-all",
              "group-hover:bg-blue-50/50",
              isSelected && "bg-blue-600 text-white font-medium group-hover:bg-blue-600",
              isToday && !isSelected && "bg-blue-100/50 group-hover:bg-blue-100"
            )}>
              {dayNumber}
            </span>
            {isSelected && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </motion.div>

      {/* Tasks List */}
      <motion.div 
        className="w-full max-w-full sm:max-w-[90%] mx-auto space-y-2 mt-4"
        variants={itemVariants}
      >
        <div className="space-y-2">
          {tasks
            .filter(task => task.defaultColumnId === defaultColumnId && isSameDay(task.date, selectedDate))
            .sort((a, b) => {
              if (a.completed === b.completed) {
                return new Date(b.updatedAt) - new Date(a.updatedAt)
              }
              return a.completed ? 1 : -1
            })
            .map(task => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-start gap-3 p-3 rounded-lg transition-colors border border-border/50",
                  "cursor-pointer shadow-sm hover:shadow-md",
                  getHoverColor(task.priority),
                  task.completed && "opacity-50"
                )}
                onClick={() => handleTaskClick(task)}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
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
                    <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-accent">
                      {task.subtasks.map((subtask, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
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
                          />
                          <span className={cn(
                            "text-sm",
                            subtask.completed && "line-through"
                          )}>
                            {subtask.title}
                          </span>
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
            ))}
        </div>
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
    </motion.div>
  )
}

TodoList.displayName = 'TodoList'

export default TodoList 