import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { AlertTriangle } from 'lucide-react'
import { useSubjects } from '../../hooks/useSubjects'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { isAfter, isBefore, startOfDay, addDays } from 'date-fns'

export function AttendanceWarning() {
  const { subjects } = useSubjects()
  const navigate = useNavigate()
  const { events, dashboardCalendars } = useGoogleCalendar()

  // Filtra eventos dos próximos 7 dias
  const upcomingEvents = events
    .filter(event => {
      if (!dashboardCalendars.includes(event.calendarId)) {
        return false
      }
      const eventDate = new Date(event.start instanceof Date ? event.start : event.start.dateTime || event.start.date)
      const today = startOfDay(new Date())
      const nextWeek = addDays(today, 7)
      return isAfter(eventDate, today) && isBefore(eventDate, nextWeek)
    })

  // Define o número de matérias a mostrar baseado na quantidade de eventos
  const numSubjectsToShow = upcomingEvents.length > 5 ? 3 : 2

  // Função para calcular a porcentagem de faltas utilizada
  const calculateAttendancePercentage = (subject) => {
    if (!subject || !subject.type1) return 0

    if (subject.hasMultipleTypes && subject.type2) {
      const type1Percentage = subject.type1?.absences && subject.maxAbsences?.type1 
        ? (subject.type1.absences / subject.maxAbsences.type1) * 100 
        : 0
      const type2Percentage = subject.type2?.absences && subject.maxAbsences?.type2 
        ? (subject.type2.absences / subject.maxAbsences.type2) * 100
        : 0
      
      return Math.max(type1Percentage, type2Percentage)
    } else {
      return subject.type1?.absences && subject.maxAbsences?.type1
        ? (subject.type1.absences / subject.maxAbsences.type1) * 100
        : 0
    }
  }

  // Função para calcular o total de faltas
  const calculateTotalAbsences = (subject) => {
    if (!subject || !subject.type1) return '0/0'

    if (subject.hasMultipleTypes && subject.type2) {
      const totalAbsences = (subject.type1?.absences || 0) + (subject.type2?.absences || 0)
      const maxAbsences = (subject.maxAbsences?.type1 || 0) + (subject.maxAbsences?.type2 || 0)
      return `${totalAbsences}/${maxAbsences}`
    } else {
      return `${subject.type1?.absences || 0}/${subject.maxAbsences?.type1 || 0}`
    }
  }

  // Função para determinar as cores e mensagens baseadas na porcentagem
  const getStatusConfig = (percentage) => {
    if (percentage >= 75) {
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-500',
        borderColor: 'border-red-500',
        message: 'Risco de reprovação por faltas!'
      }
    } else if (percentage >= 50) {
      return {
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-500',
        borderColor: 'border-yellow-500',
        message: 'Atenção ao número de faltas!'
      }
    } else {
      return {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-500',
        borderColor: 'border-green-500',
        message: 'Faltas dentro do limite'
      }
    }
  }

  const processedSubjects = subjects
    .map(subject => ({
      ...subject,
      percentage: calculateAttendancePercentage(subject)
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const subjectsAtRisk = processedSubjects.filter(subject => subject.percentage >= 75)
  const shouldShowRiskWarning = subjects.length > 3 && subjectsAtRisk.length > 0
  const additionalSubjects = subjects.length - numSubjectsToShow
  const additionalRiskSubjects = subjectsAtRisk.length - numSubjectsToShow // Matérias em risco além das mostradas

  return (
    <Card 
      className={cn(
        "border-l-4 shadow-md hover:bg-accent/10 cursor-pointer transition-colors h-full flex flex-col",
        subjects.some(s => calculateAttendancePercentage(s) >= 75)
          ? "border-l-red-500"
          : subjects.some(s => calculateAttendancePercentage(s) >= 50)
          ? "border-l-yellow-500"
          : "border-l-green-500"
      )}
      onClick={() => navigate('/attendance')}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <AlertTriangle className={cn(
              "h-4 w-4",
              subjects.some(s => calculateAttendancePercentage(s) >= 75)
                ? "text-red-500"
                : subjects.some(s => calculateAttendancePercentage(s) >= 50)
                ? "text-yellow-500"
                : "text-green-500"
            )} />
            {subjects.some(s => calculateAttendancePercentage(s) >= 75)
              ? "Risco de Reprovação"
              : subjects.some(s => calculateAttendancePercentage(s) >= 50)
              ? "Atenção às Faltas"
              : "Controle de Faltas"}
          </div>
          {additionalRiskSubjects > 0 && (
            <span className="text-sm text-red-500">
              +{additionalRiskSubjects} matéria{additionalRiskSubjects > 1 ? 's' : ''} em risco
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          {processedSubjects.slice(0, numSubjectsToShow).map(subject => {
            const totalAbsences = calculateTotalAbsences(subject)
            const status = getStatusConfig(subject.percentage)

            return (
              <div 
                key={subject.id}
                className={cn(
                  "flex flex-col space-y-1 p-3 rounded-lg border",
                  status.bgColor,
                  status.borderColor
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("font-medium", status.textColor)}>
                    {subject.name}
                  </span>
                  <span className="text-sm">{totalAbsences} faltas</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className={status.textColor}>
                    {status.message}
                  </span>
                  <span className={status.textColor}>
                    {Math.round(subject.percentage)}% utilizado
                  </span>
                </div>
              </div>
            )
          })}
          
          {additionalSubjects > 0 && (
            <div className="text-center">
              <button 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => navigate('/attendance')}
              >
                + outras matérias
              </button>
            </div>
          )}

          {subjects.length === 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Nenhuma matéria cadastrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 