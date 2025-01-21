import { createContext, useContext, useState, useEffect } from 'react'
import { useSubjects } from '../hooks/useSubjects'
import { useTasks } from '../hooks/useTasks'

const NotificationContext = createContext()

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const { subjects } = useSubjects()
  const { tasks } = useTasks()

  useEffect(() => {
    const newNotifications = []

    // Verifica matérias com risco de faltas
    subjects.forEach(subject => {
      const absencePercentage = subject.hasMultipleTypes 
        ? (((subject.type1.absences || 0) * subject.type1.hoursPerClass + 
            (subject.type2.absences || 0) * subject.type2.hoursPerClass) / 
           subject.maxAbsences.totalHours) * 100
        : ((subject.type1.absences || 0) * subject.type1.hoursPerClass / 
           subject.maxAbsences.totalHours) * 100

      if (absencePercentage > 75) {
        newNotifications.push({
          id: `absence-${subject.id}`,
          type: 'danger',
          title: 'Risco de Reprovação',
          message: `${subject.name} está com ${Math.round(absencePercentage)}% de faltas`,
          link: '/attendance'
        })
      } else if (absencePercentage > 50) {
        newNotifications.push({
          id: `absence-${subject.id}`,
          type: 'warning',
          title: 'Atenção às Faltas',
          message: `${subject.name} está com ${Math.round(absencePercentage)}% de faltas`,
          link: '/attendance'
        })
      }
    })

    // Verifica tarefas próximas do prazo
    const today = new Date()
    tasks.forEach(task => {
      if (!task.completed && task.dueDate) {
        const dueDate = new Date(task.dueDate)
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

        if (diffDays <= 3 && diffDays > 0) {
          newNotifications.push({
            id: `task-${task.id}`,
            type: 'warning',
            title: 'Prazo Próximo',
            message: `"${task.title}" vence em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
            link: '/tasks'
          })
        } else if (diffDays <= 0) {
          newNotifications.push({
            id: `task-${task.id}`,
            type: 'danger',
            title: 'Prazo Vencido',
            message: `"${task.title}" está atrasada`,
            link: '/tasks'
          })
        }
      }
    })

    setNotifications(newNotifications)
  }, [subjects, tasks])

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const value = {
    notifications,
    clearNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
} 