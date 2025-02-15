import { useMemo } from 'react'

// Função pura para calcular estatísticas
function calculateStats(subject) {
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
}

export function useSubjectsWithStats(subjects) {
  const subjectsWithStats = useMemo(() => {
    return subjects.map(subject => ({
      ...subject,
      stats: calculateStats(subject)
    }))
  }, [subjects])

  const filterAndSort = (searchQuery = '', filterStatus = 'all', sortBy = 'name') => {
    return subjectsWithStats
      .filter(subject => {
        if (!subject?.type1) return false
        
        // Filtro por busca
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (!subject.name.toLowerCase().includes(query)) return false
        }
        
        // Filtro por status
        if (filterStatus === 'risk' && subject.stats.status !== 'risk') return false
        if (filterStatus === 'warning' && subject.stats.status !== 'warning') return false
        if (filterStatus === 'normal' && subject.stats.status !== 'normal') return false
        
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'percentage':
            return b.stats.percentage - a.stats.percentage
          case 'remaining':
            return b.stats.remainingAbsences - a.stats.remainingAbsences
          default:
            return 0
        }
      })
  }

  return {
    subjectsWithStats,
    filterAndSort
  }
} 