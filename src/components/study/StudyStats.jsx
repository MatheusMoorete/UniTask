import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { differenceInDays } from 'date-fns'
import { useStudyRoom } from '../../hooks/useStudyRoom'

export function StudyStats() {
  const { topics: exams } = useStudyRoom() // Renomeado para melhor semântica

  // Calcula próximas provas (ordenadas por data)
  const upcomingExams = exams
    .filter(exam => exam.examDate && new Date(exam.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .slice(0, 3)
    .map(exam => ({
      title: exam.title,
      daysUntil: differenceInDays(new Date(exam.examDate), new Date())
    }))

  // Calcula estatísticas detalhadas de progresso
  const examStats = exams.map(exam => {
    const totalTopics = exam.topics?.length || 0
    const completedTopics = exam.topics?.filter(topic => topic.completed).length || 0
    const needsRevision = exam.topics?.filter(topic => topic.completed && topic.needsRevision).length || 0
    
    return {
      id: exam.id,
      title: exam.title,
      totalTopics,
      completedTopics,
      needsRevision,
      progress: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      daysUntil: exam.examDate ? differenceInDays(new Date(exam.examDate), new Date()) : null
    }
  })

  // Estatísticas gerais
  const totalStats = {
    totalExams: exams.length,
    totalTopics: examStats.reduce((sum, exam) => sum + exam.totalTopics, 0),
    completedTopics: examStats.reduce((sum, exam) => sum + exam.completedTopics, 0),
    needsRevision: examStats.reduce((sum, exam) => sum + exam.needsRevision, 0)
  }

  // Progresso geral (baseado em tópicos, não em provas)
  const totalProgress = totalStats.totalTopics > 0
    ? Math.round((totalStats.completedTopics / totalStats.totalTopics) * 100)
    : 0

  // Calcula revisões pendentes
  const todayRevisions = exams.reduce((count, exam) => {
    if (!exam.examDate) return count
    
    const daysUntilExam = differenceInDays(new Date(exam.examDate), new Date())
    if (daysUntilExam <= 1 && daysUntilExam >= 0) {
      const topicsNeedingRevision = exam.topics?.filter(topic => 
        topic.completed && topic.needsRevision
      ).length || 0
      return count + topicsNeedingRevision
    }
    return count
  }, 0)

  const weekRevisions = exams.reduce((count, exam) => {
    if (!exam.examDate) return count
    
    const daysUntilExam = differenceInDays(new Date(exam.examDate), new Date())
    if (daysUntilExam <= 7 && daysUntilExam >= 0) {
      const topicsNeedingRevision = exam.topics?.filter(topic => 
        topic.completed && topic.needsRevision
      ).length || 0
      return count + topicsNeedingRevision
    }
    return count
  }, 0)

  return (
    <div className="hidden sm:block w-[28%] space-y-4 sticky top-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo de Estudos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Próximas Provas</h4>
            <div className="space-y-2">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate mr-2">{exam.title}</span>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {exam.daysUntil === 0 
                        ? 'Hoje'
                        : exam.daysUntil === 1
                        ? 'Amanhã'
                        : `Em ${exam.daysUntil} dias`}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Nenhuma prova agendada
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Progresso Geral</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tópicos Estudados</span>
                  <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total de Tópicos</span>
                  <span>{totalStats.totalTopics}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tópicos Concluídos</span>
                  <span>{totalStats.completedTopics}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Precisam de Revisão</span>
                  <span>{totalStats.needsRevision}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Revisões Pendentes</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Hoje</span>
                <Badge variant={todayRevisions > 0 ? "default" : "secondary"}>
                  {todayRevisions}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Esta Semana</span>
                <Badge variant={weekRevisions > 0 ? "default" : "secondary"}>
                  {weekRevisions}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 