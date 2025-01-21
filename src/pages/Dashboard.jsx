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

const TaskProgress = () => {
  const { tasks } = useTasks()
  const navigate = useNavigate()
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = tasks.filter(task => !task.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <Card 
      className="border-l-4 border-l-primary shadow-md hover:bg-accent/10 cursor-pointer transition-colors"
      onClick={() => navigate('/tasks')}
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

const AttendanceWarning = () => {
  const { subjects } = useSubjects()
  const navigate = useNavigate()
  
  // Processa todas as matérias com suas porcentagens de falta
  const processedSubjects = subjects
    .map(subject => ({
      ...subject,
      absencePercentage: subject.hasMultipleTypes 
        ? (((subject.type1.absences || 0) * subject.type1.hoursPerClass + 
            (subject.type2.absences || 0) * subject.type2.hoursPerClass) / 
           subject.maxAbsences.totalHours) * 100
        : ((subject.type1.absences || 0) * subject.type1.hoursPerClass / 
           subject.maxAbsences.totalHours) * 100
    }))
    .sort((a, b) => b.absencePercentage - a.absencePercentage)

  // Separa as matérias em risco (>50% de faltas)
  const subjectsAtRisk = processedSubjects.filter(
    subject => subject.absencePercentage > 50
  )

  // Pega as duas principais para exibição
  const mainSubjects = processedSubjects.slice(0, 2)
  
  // Calcula quantas matérias em risco não estão sendo mostradas
  const additionalRiskSubjects = Math.max(0, subjectsAtRisk.length - 2)

  return (
    <Card 
      className="border-l-4 border-l-destructive shadow-md hover:bg-accent/10 cursor-pointer transition-colors"
      onClick={() => navigate('/attendance')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Cuidado com as Faltas
          </div>
          {additionalRiskSubjects > 0 && (
            <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full">
              +{additionalRiskSubjects} {additionalRiskSubjects === 1 ? 'matéria' : 'matérias'} em risco
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mainSubjects.map((subject) => (
            <Alert
              key={subject.id}
              variant={
                subject.absencePercentage > 75 ? "destructive" :
                subject.absencePercentage > 50 ? "warning" :
                "success"
              }
              className="py-2"
            >
              <AlertTitle className="flex justify-between items-center">
                <span>{subject.name}</span>
                <span className="text-xs">
                  {subject.hasMultipleTypes ? (
                    `${subject.type1.absences || 0}/${subject.maxAbsences.type1} T, ${subject.type2.absences || 0}/${subject.maxAbsences.type2} P`
                  ) : (
                    `${subject.type1.absences || 0}/${subject.maxAbsences.type1} faltas`
                  )}
                </span>
              </AlertTitle>
              <AlertDescription className="flex justify-between items-center">
                {subject.absencePercentage > 75 
                  ? "Risco de reprovação por faltas!" 
                  : subject.absencePercentage > 50
                  ? "Atenção ao número de faltas!"
                  : ""}
                <span className="text-xs font-medium">
                  {Math.round(subject.absencePercentage)}% utilizado
                </span>
              </AlertDescription>
            </Alert>
          ))}
          {subjects.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Nenhuma matéria cadastrada
            </div>
          )}
          {additionalRiskSubjects > 0 && (
            <div className="text-sm text-muted-foreground text-center pt-2 border-t">
              Clique para ver todas as matérias em risco
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const FocusTime = () => {
  const { loading, getTodayFocusTime, formatTime, getStreak } = usePomodoro()
  const todayTime = getTodayFocusTime()
  const streak = getStreak()
  const navigate = useNavigate()

  if (loading) {
    return (
      <Card className="border-l-4 border-l-secondary shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-secondary" />
            Tempo Focado
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          <div className="h-8 w-8 bg-secondary/20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="border-l-4 border-l-secondary shadow-md hover:bg-accent/10 cursor-pointer transition-colors"
      onClick={() => navigate('/pomodoro')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-secondary" />
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 420)
  const [isEditingSemester, setIsEditingSemester] = useState(false)
  const [semester, setSemester] = useState('2º Semestre 2024')
  const [tempSemester, setTempSemester] = useState(semester)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 420)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSemesterEdit = () => {
    if (isEditingSemester) {
      setSemester(tempSemester)
    }
    setIsEditingSemester(!isEditingSemester)
  }

  // Versão mobile do dashboard
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Cards simplificados para mobile */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Brain className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">4h</div>
                <p className="text-xs text-muted-foreground">Tempo Focado</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Target className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Prazos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingDeadlines />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Versão desktop do dashboard (mantenha o layout original)
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
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

      <div className="grid grid-cols-2 gap-4">
        <TaskProgress />
        <FocusTime />
        <NextDeadlines />
        <AttendanceWarning />
      </div>
    </div>
  )
}

export default Dashboard 