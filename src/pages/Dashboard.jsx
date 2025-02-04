import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import ProgressRing from '../components/ui/progress-ring'
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Brain,
  TrendingUp,
  Target,
  Award,
  Pencil,
  Check
} from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useSubjects } from '../hooks/useSubjects'
import { usePomodoro } from '../hooks/usePomodoro'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Input } from '../components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert'
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines'
import { useAuth } from '../contexts/AuthContext'
import { NextDeadlines } from '../components/dashboard/NextDeadlines'
import { AttendanceWarning } from '@/components/dashboard/AttendanceWarning'
import { useFirestore } from '../contexts/FirestoreContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const TaskProgress = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { db } = useFirestore()

  // Fetch TodoList tasks
  useEffect(() => {
    if (!user?.uid) {
      setTasks([])
      setLoading(false)
      return
    }

    const todoTasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '!=', null),
      where('defaultColumnId', '==', 'todo')
    )

    const unsubscribe = onSnapshot(todoTasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTasks(tasksData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, db])

  // Calculate stats
  const completedTasks = tasks.filter(task => task.completed && task.defaultColumnId === 'todo').length
  const pendingTasks = tasks.filter(task => !task.completed && task.defaultColumnId === 'todo').length
  const totalTasks = tasks.filter(task => task.defaultColumnId === 'todo').length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <Card 
      className="border-l-4 border-l-primary shadow-md hover:bg-accent/10 cursor-pointer transition-colors h-full"
      onClick={() => navigate('/todo')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          Progresso das Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex gap-2 items-center text-sm">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span className="font-medium">{completedTasks} completas</span>
            </div>
            <div className="flex gap-2 items-center text-sm">
              <AlertCircle className="h-3 w-3 text-yellow-500" />
              <span className="font-medium">{pendingTasks} pendentes</span>
            </div>
          </div>
          <ProgressRing progress={progressPercentage} size={50} />
        </div>
      </CardContent>
    </Card>
  )
}

const FocusTime = () => {
  const { loading, getTodayFocusTime, formatTime, getStreak } = usePomodoro()
  const todayTime = getTodayFocusTime()
  const streak = getStreak()

  return (
    <Card className="border-l-4 border-l-secondary shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-secondary" />
          Tempo Focado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold">{formatTime(todayTime)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{streak} dias seguidos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const [isEditingSemester, setIsEditingSemester] = useState(false)
  const [semester, setSemester] = useState('2º Semestre 2024')
  const [tempSemester, setTempSemester] = useState(semester)
  const { getTodayFocusTime, formatTime, getStreak } = usePomodoro()
  const todayTime = getTodayFocusTime()
  const streak = getStreak()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { db } = useFirestore()

  // Fetch TodoList tasks
  useEffect(() => {
    if (!user?.uid) {
      setTasks([])
      setLoading(false)
      return
    }

    const todoTasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '!=', null),
      where('defaultColumnId', '==', 'todo')
    )

    const unsubscribe = onSnapshot(todoTasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTasks(tasksData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, db])

  // Calculate task stats
  const pendingTasks = tasks.filter(task => !task.completed && task.defaultColumnId === 'todo').length

  const handleSemesterEdit = () => {
    if (isEditingSemester) {
      setSemester(tempSemester)
    }
    setIsEditingSemester(!isEditingSemester)
  }

  return (
    <div className="h-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe seu progresso acadêmico
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-accent/10 px-3 py-1.5 rounded-md">
          <BookOpen className="h-4 w-4" />
          {isEditingSemester ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempSemester}
                onChange={(e) => setTempSemester(e.target.value)}
                className="h-6 text-sm w-32"
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSemesterEdit}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{semester}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSemesterEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* Mobile Stats Cards - Visible only on small screens */}
        <div className="grid grid-cols-2 gap-4 sm:hidden">
          <Card className="border-l-4 border-l-secondary shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Tempo Focado</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{formatTime(todayTime)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{streak} dias seguidos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Tarefas</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{pendingTasks}</p>
                  <p className="text-xs text-muted-foreground">pendentes hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Cards - Hidden on mobile, visible on sm and up */}
        <div className="hidden sm:block h-full">
          <TaskProgress />
        </div>
        <div className="hidden sm:block h-full">
          <FocusTime />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <NextDeadlines />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <AttendanceWarning />
        </div>
      </div>
    </div>
  )
}

export default Dashboard 