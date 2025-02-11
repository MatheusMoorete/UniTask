import { useState, useEffect } from 'react'
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { TaskDialog } from './TaskDialog'
import { TaskCard } from './TaskCard'
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

function TodoList() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskCard, setShowTaskCard] = useState(false)
  const { events = [] } = useGoogleCalendar()
  const [tags, setTags] = useState([])
  const [tasks, setTasks] = useState([])
  const defaultColumnId = 'todo'

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
          const userTasks = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tags: doc.data().tags || [], // Garantir que tags existe
            isExpanded: false // Inicialmente todas as tarefas estão recolhidas
          }))
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
        isExpanded: false, // Inicialmente a tarefa está recolhida
        // Garantir que a data seja um objeto Date válido
        date: taskData.date instanceof Date ? taskData.date : new Date(taskData.date || selectedDate),
        tags: taskData.tags || []
      }

      if (selectedTask) {
        // Editar tarefa existente
        const taskRef = doc(db, 'tasks', selectedTask.id)
        await updateDoc(taskRef, newTask)
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...newTask, id: selectedTask.id } : t))
      } else {
        // Adicionar nova tarefa
        const docRef = await addDoc(collection(db, 'tasks'), newTask)
        const addedTask = { ...newTask, id: docRef.id }
        setTasks([...tasks, addedTask])
      }
      setSelectedTask(null)
      setIsTaskDialogOpen(false)
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
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const updatedTask = { ...task, completed: !task.completed }
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, updatedTask)
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskUpdate = async (updatedTask) => {
    try {
      if (!updatedTask?.id) return

      // Garantir que a data seja um objeto Date válido
      const taskToUpdate = {
        ...updatedTask,
        date: updatedTask.date instanceof Date ? updatedTask.date : new Date(updatedTask.date),
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

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleAddFromCalendar = (event) => {
    if (!event) return

    const newTask = {
      id: Date.now().toString(),
      title: event.summary || '',
      description: event.description || '',
      date: new Date(event.start?.dateTime || event.start?.date || new Date()),
      priority: 'P2',
      completed: false,
      subtasks: [],
      tags: [],
      location: event.location || '',
      calendarEventId: event.id,
      userId: user?.uid,
      defaultColumnId: 'todo',
      position: tasks?.length || 0,
      updatedAt: new Date()
    }
    setTasks([...tasks, newTask])
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

  // Gera os dias do mês atual
  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  })

  // Gera os dias da semana a partir do domingo
  const weekDays = selectedDate ? Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startOfWeek(selectedDate), index)
    return {
      date,
      dayName: format(date, 'EEE', { locale: ptBR }),
      dayNumber: format(date, 'd'),
      isSelected: format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    }
  }) : []

  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setShowTaskCard(true)
  }

  const handleCloseTaskCard = () => {
    setSelectedTask(null)
    setShowTaskCard(false)
  }

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

  // Filtrar tarefas do dia selecionado
  const filteredTasks = tasks.filter(task => {
    try {
      return task && task.date && isSameDay(task.date, selectedDate)
    } catch (error) {
      console.error('Error filtering task:', error)
      return false
    }
  })

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

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">ToDo List</h1>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[180px] flex items-center justify-center text-center font-normal",
                  "transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:bg-primary/5 hover:text-foreground",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: ptBR }) : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CustomCalendar 
                selectedDate={selectedDate || new Date()}
                onDateSelect={setSelectedDate}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
            className="h-9 w-9 transition-all duration-200 hover:shadow-sm hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleToday}
            className="h-9 px-3 transition-all duration-200 hover:shadow-sm hover:bg-primary/10 hover:text-primary"
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="h-9 w-9 transition-all duration-200 hover:shadow-sm hover:bg-primary/10 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setIsTaskDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar tarefa
        </Button>
      </div>

      {/* Barra de navegação dos dias */}
      <div className="grid grid-cols-7 border-b mb-6">
        {weekDays.map(({ date, dayName, dayNumber, isSelected, isToday }) => (
          <button
            key={format(date, 'yyyy-MM-dd')}
            onClick={() => setSelectedDate(date)}
            className={cn(
              "flex flex-col items-center py-2 transition-colors border-b-2",
              isSelected 
                ? "border-primary text-primary font-medium bg-primary/5" 
                : "border-transparent hover:bg-primary/[0.03]",
              !isSelected && isToday && "text-primary"
            )}
          >
            <span className={cn(
              "text-xs capitalize",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {dayName}
            </span>
            <span className={cn(
              "text-sm",
              isSelected && "font-bold"
            )}>
              {dayNumber}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma tarefa para este dia
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border border-gray-200/75 transition-all hover:shadow-md bg-white",
                "transform hover:-translate-y-0.5 duration-200",
                task.priority === 'P1' && "hover:bg-red-50/50",
                task.priority === 'P2' && "hover:bg-yellow-50/50",
                task.priority === 'P3' && "hover:bg-green-50/50",
                !['P1', 'P2', 'P3'].includes(task.priority) && "hover:bg-gray-50/50"
              )}
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-center self-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id)}
                  className="h-4 w-4 rounded-full border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className={cn(
                      "font-medium truncate",
                      task.completed ? 'line-through text-muted-foreground' : ''
                    )}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.priority && (
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium shadow-sm",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority}
                      </span>
                    )}
                    {task.calendarEventId && (
                      <CalendarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </div>
                {task.subtasks?.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTasks(prev => prev.map(t => 
                          t.id === task.id 
                            ? { ...t, isExpanded: !t.isExpanded }
                            : t
                        ))
                      }}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          task.isExpanded && "transform rotate-180"
                        )}
                      />
                      <span>{task.subtasks.length} subtarefa{task.subtasks.length !== 1 ? 's' : ''}</span>
                    </button>
                    
                    {task.isExpanded && (
                      <div className="mt-2 space-y-1.5 pl-6">
                        {task.subtasks.map((subtask, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-accent/5 rounded p-0.5"
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
                              className="h-3.5 w-3.5 rounded border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className={cn(
                              "truncate",
                              subtask.completed && 'line-through'
                            )}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {task.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {task.location && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{task.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Card Dialog */}
      <TaskCard
        task={selectedTask}
        isOpen={showTaskCard}
        onOpenChange={setShowTaskCard}
        onUpdate={handleTaskUpdate}
        onDelete={handleDeleteTask}
        tags={tags}
        onTagCreate={handleAddTag}
        onTagDelete={handleDeleteTag}
      />

      {/* Dialog de Tarefa */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onSubmit={handleAddTask}
        onDelete={handleDeleteTask}
        calendarEvents={events}
        onAddFromCalendar={handleAddFromCalendar}
        tags={tags}
        onTagCreate={handleAddTag}
        onTagDelete={handleDeleteTag}
        columnId={defaultColumnId}
      />
    </div>
  )
}

TodoList.displayName = 'TodoList'

export default TodoList 