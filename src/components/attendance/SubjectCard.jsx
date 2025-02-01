import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Plus, Minus, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

const SubjectCard = ({ subject, onUpdate, onDelete }) => {
  const [absences, setAbsences] = useState(subject.absences || 0)
  
  const maxAbsences = Math.floor((subject.totalClasses * subject.maxAbsencePercentage) / 100)
  const remainingAbsences = maxAbsences - absences
  const absencePercentage = (absences / maxAbsences) * 100
  
  const handleAddAbsence = () => {
    const newAbsences = absences + 1
    setAbsences(newAbsences)
    onUpdate({ ...subject, absences: newAbsences })
  }

  const handleRemoveAbsence = () => {
    if (absences > 0) {
      const newAbsences = absences - 1
      setAbsences(newAbsences)
      onUpdate({ ...subject, absences: newAbsences })
    }
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 70) {
      return 'text-destructive'
    } else if (percentage > 50) {
      return 'text-warning'
    } else {
      return 'text-success'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{subject.name}</CardTitle>
            <CardDescription>
              {subject.totalHours}h • {subject.totalClasses} aulas
            </CardDescription>
          </div>
          {absencePercentage >= 75 && (
            <AlertTriangle 
              className={getStatusColor(absencePercentage)} 
              aria-label="Alerta de faltas"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Faltas: {absences} de {maxAbsences} permitidas</span>
            <span className={getStatusColor(absencePercentage)}>
              {absencePercentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={absencePercentage}
            max={100}
            className={cn("h-2", {
              "bg-success/20": absencePercentage < 50,
              "bg-warning/20": absencePercentage >= 50 && absencePercentage < 70,
              "bg-destructive/20": absencePercentage >= 70
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAbsence}
            disabled={absences === 0}
            className="flex-1"
          >
            <Minus className="h-4 w-4 mr-2" />
            Remover Falta
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAbsence}
            disabled={absences >= maxAbsences}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Falta
          </Button>
        </div>

        <p className={cn("text-sm", getStatusColor(absencePercentage))}>
          {remainingAbsences > 0
            ? `Você ainda pode ter ${remainingAbsences} falta${remainingAbsences !== 1 ? 's' : ''}`
            : 'Você atingiu o limite de faltas!'}
        </p>
      </CardContent>
    </Card>
  )
}

export default SubjectCard 