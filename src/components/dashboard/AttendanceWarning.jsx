import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { AlertTriangle } from 'lucide-react'
import { useSubjects } from '../../hooks/useSubjects'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function AttendanceWarning() {
  const { subjects } = useSubjects()
  const navigate = useNavigate()

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
    if (percentage >= 70) {
      return {
        bgColor: 'bg-destructive/10',
        textColor: 'text-destructive',
        borderColor: 'border-destructive',
        message: 'Risco de reprovação por faltas!'
      }
    } else if (percentage > 50) {
      return {
        bgColor: 'bg-warning/10',
        textColor: 'text-warning',
        borderColor: 'border-warning',
        message: 'Atenção ao número de faltas!'
      }
    } else {
      return {
        bgColor: 'bg-success/10',
        textColor: 'text-success',
        borderColor: 'border-success',
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

  const subjectsAtRisk = processedSubjects.filter(subject => subject.percentage >= 70)
  const shouldShowRiskWarning = subjects.length > 3 && subjectsAtRisk.length > 0
  const additionalSubjects = subjects.length - 2
  const additionalRiskSubjects = subjectsAtRisk.length - 2 // Matérias em risco além das 2 mostradas

  return (
    <Card 
      className={cn(
        "border-l-4 shadow-md hover:bg-accent/10 cursor-pointer transition-colors",
        subjects.some(s => calculateAttendancePercentage(s) >= 70)
          ? "border-l-destructive"
          : subjects.some(s => calculateAttendancePercentage(s) > 50)
          ? "border-l-warning"
          : "border-l-success"
      )}
      onClick={() => navigate('/attendance')}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Cuidado com as Faltas
          </div>
          {additionalRiskSubjects > 0 && (
            <span className="text-sm text-destructive">
              +{additionalRiskSubjects} matéria{additionalRiskSubjects > 1 ? 's' : ''} em risco
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {processedSubjects.slice(0, 2).map(subject => {
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