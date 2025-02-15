import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import ProgressRing from '../components/ui/progress-ring'
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Target,
  Pencil,
  Check
} from 'lucide-react'
import { usePomodoro } from '../hooks/usePomodoro'
import {useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { NextDeadlines } from '../components/dashboard/NextDeadlines'
import { AttendanceWarning } from '@/components/dashboard/AttendanceWarning'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'

const TaskProgress = () => {
  const [tasks, setTasks] = useState([])
  const [ setLoading] = useState(true)
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
  const { getTodayFocusTime, formatTime, getStreak } = usePomodoro()
  const navigate = useNavigate()
  const todayTime = getTodayFocusTime()
  const streak = getStreak()

  return (
    <Card 
      className="border-l-4 border-l-secondary shadow-md hover:bg-accent/10 cursor-pointer transition-colors h-full"
      onClick={() => navigate('/pomodoro')}
    >
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

function Dashboard() {
  const { user } = useAuth()
  const [isEditingSemester, setIsEditingSemester] = useState(false)
  const [semester, setSemester] = useState('2º Semestre 2024')
  const [tempSemester, setTempSemester] = useState(semester)
  const { getTodayFocusTime, formatTime, getStreak } = usePomodoro()
  const todayTime = getTodayFocusTime()
  const streak = getStreak()
  const [tasks, setTasks] = useState([])
  const [setLoading] = useState(true)
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

  return (
    <motion.div 
      className="space-y-6 max-w-full p-2 sm:p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Cabeçalho */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu progresso acadêmico e mantenha-se organizado
          </p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          {isEditingSemester ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempSemester}
                onChange={(e) => setTempSemester(e.target.value)}
                className="h-8 text-sm"
              />
              <Button size="sm" variant="ghost" onClick={handleSemesterEdit}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{semester}</span>
              <Button size="sm" variant="ghost" onClick={handleSemesterEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
        variants={itemVariants}
      >
        {/* Mobile Stats Cards */}
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-2 gap-4 sm:hidden"
            variants={itemVariants}
          >
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
          </motion.div>
        </AnimatePresence>

        {/* Desktop Cards */}
        <motion.div 
          className="hidden sm:block h-full"
          variants={itemVariants}
        >
          <TaskProgress />
        </motion.div>
        <motion.div 
          className="hidden sm:block h-full"
          variants={itemVariants}
        >
          <FocusTime />
        </motion.div>

        {/* Próximos Prazos e Avisos */}
        <motion.div 
          className="col-span-1 sm:col-span-2 lg:col-span-1"
          variants={itemVariants}
        >
          <NextDeadlines />
        </motion.div>
        <motion.div 
          className="col-span-1 sm:col-span-2 lg:col-span-1"
          variants={itemVariants}
        >
          <AttendanceWarning />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

Dashboard.displayName = 'Dashboard'

export default Dashboard 