import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { differenceInDays } from 'date-fns'
import { useStudyRoom } from '../../hooks/useStudyRoom'
import { motion } from 'framer-motion'
import { Calendar, Brain, Target, Clock } from 'lucide-react'
import PropTypes from 'prop-types'

StudyStats.propTypes = {
  filteredTopics: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    examDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    topics: PropTypes.arrayOf(PropTypes.shape({
      completed: PropTypes.bool,
      needsRevision: PropTypes.bool
    }))
  })).isRequired
}

export function StudyStats({ filteredTopics }) {
  const { topics: allTopics } = useStudyRoom()

  // Calcula próximas provas (ordenadas por data)
  const upcomingExams = filteredTopics
    .filter(exam => exam.examDate && new Date(exam.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .slice(0, 3)
    .map(exam => ({
      title: exam.title,
      daysUntil: differenceInDays(new Date(exam.examDate), new Date())
    }))

  // Estatísticas dos tópicos filtrados
  const filteredStats = {
    totalTopics: filteredTopics.reduce((sum, exam) => sum + exam.topics.length, 0),
    completedTopics: filteredTopics.reduce((sum, exam) => 
      sum + exam.topics.filter(t => t.completed).length, 0
    ),
    needsRevision: filteredTopics.reduce((sum, exam) => 
      sum + exam.topics.filter(t => t.completed && t.needsRevision).length, 0
    )
  }

  // Estatísticas gerais (todos os tópicos)
  const totalStats = {
    totalExams: allTopics.length,
    totalTopics: allTopics.reduce((sum, exam) => sum + exam.topics.length, 0),
    completedTopics: allTopics.reduce((sum, exam) => 
      sum + exam.topics.filter(t => t.completed).length, 0
    ),
    needsRevision: allTopics.reduce((sum, exam) => 
      sum + exam.topics.filter(t => t.completed && t.needsRevision).length, 0
    )
  }

  // Progresso dos tópicos filtrados
  const filteredProgress = filteredStats.totalTopics > 0
    ? Math.round((filteredStats.completedTopics / filteredStats.totalTopics) * 100)
    : 0

  // Progresso geral
  const totalProgress = totalStats.totalTopics > 0
    ? Math.round((totalStats.completedTopics / totalStats.totalTopics) * 100)
    : 0

  // Estatísticas de revisão
  const revisionStats = {
    today: filteredTopics.reduce((count, exam) => {
      if (!exam.examDate) return count
      const daysUntilExam = differenceInDays(new Date(exam.examDate), new Date())
      if (daysUntilExam <= 1 && daysUntilExam >= 0) {
        return count + exam.topics.filter(t => t.completed && t.needsRevision).length
      }
      return count
    }, 0),
    week: filteredTopics.reduce((count, exam) => {
      if (!exam.examDate) return count
      const daysUntilExam = differenceInDays(new Date(exam.examDate), new Date())
      if (daysUntilExam <= 7 && daysUntilExam >= 0) {
        return count + exam.topics.filter(t => t.completed && t.needsRevision).length
      }
      return count
    }, 0)
  }

  return (
    <motion.div 
      className="hidden sm:block w-[28%] space-y-4 sticky top-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Resumo de Estudos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Próximas Provas */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Próximas Provas
            </h4>
            <div className="space-y-2">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="truncate mr-2">{exam.title}</span>
                    <Badge variant={exam.daysUntil <= 7 ? "destructive" : "secondary"}>
                      {exam.daysUntil === 0 
                        ? 'Hoje'
                        : exam.daysUntil === 1
                        ? 'Amanhã'
                        : `Em ${exam.daysUntil} dias`}
                    </Badge>
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

          {/* Progresso */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Progresso
            </h4>
            <div className="space-y-4">
              {/* Progresso dos Filtrados */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tópicos Filtrados</span>
                  <span>{filteredProgress}%</span>
                </div>
                <Progress value={filteredProgress} className="h-2" />
              </div>
              
              {/* Progresso Geral */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso Geral</span>
                  <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Filtrados</div>
                  <div className="font-medium">{filteredStats.completedTopics}/{filteredStats.totalTopics}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Total</div>
                  <div className="font-medium">{totalStats.completedTopics}/{totalStats.totalTopics}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Revisões */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Revisões Pendentes
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hoje</span>
                <Badge variant={revisionStats.today > 0 ? "destructive" : "secondary"}>
                  {revisionStats.today}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Esta Semana</span>
                <Badge variant={revisionStats.week > 0 ? "default" : "secondary"}>
                  {revisionStats.week}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {filteredStats.needsRevision} tópicos precisam de revisão
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 