import { useMemo } from 'react'

export function useAttendanceStats(subject) {
  const stats = useMemo(() => {
    if (!subject?.type1 || !subject?.maxAbsences) {
      return {
        percentage: 0,
        remainingAbsences: 0,
        status: 'normal',
        totalAbsences: 0,
        maxAbsences: 0
      }
    }

    let totalAbsences = 0
    let maxAbsences = 0

    if (subject.hasMultipleTypes && subject.type2) {
      // Para disciplinas com dois tipos de aula
      totalAbsences = (subject.type1.absences || 0) + (subject.type2.absences || 0)
      maxAbsences = (subject.maxAbsences.type1 || 0) + (subject.maxAbsences.type2 || 0)
    } else {
      // Para disciplinas com um tipo de aula
      totalAbsences = subject.type1.absences || 0
      maxAbsences = subject.maxAbsences.type1 || 0
    }

    const percentage = maxAbsences > 0 ? (totalAbsences / maxAbsences) * 100 : 0
    const remainingAbsences = Math.max(0, maxAbsences - totalAbsences)

    let status = 'normal'
    if (percentage >= 75) {
      status = 'risk'
    } else if (percentage >= 50) {
      status = 'warning'
    }

    return {
      percentage,
      remainingAbsences,
      status,
      totalAbsences,
      maxAbsences
    }
  }, [subject])

  return stats
} 