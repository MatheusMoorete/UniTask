import { useState } from 'react'
import { addDays, differenceInDays, parseISO, setHours, setMinutes } from 'date-fns'
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext'

export function useStudyRevisions() {
  const { createEvent } = useGoogleCalendar()
  const [isGenerating, setIsGenerating] = useState(false)

  // Calcula os intervalos de revisão baseado nos dias até a prova
  const calculateRevisionIntervals = (examDate) => {
    const today = new Date()
    const exam = parseISO(examDate)
    const daysUntilExam = differenceInDays(exam, today)

    // Ajusta os intervalos baseado no tempo disponível
    if (daysUntilExam <= 7) {
      return [1, 3, 5] // Revisões mais frequentes para provas próximas
    } else if (daysUntilExam <= 15) {
      return [2, 5, 10] // Intervalos médios
    } else {
      return [3, 7, 15] // Intervalos padrão para provas distantes
    }
  }

  // Gera eventos de revisão no Google Calendar
  const generateRevisionSchedule = async (topic, calendarId) => {
    try {
      setIsGenerating(true)
      console.log('Gerando cronograma para:', topic)
      const intervals = calculateRevisionIntervals(topic.examDate)
      console.log('Intervalos calculados:', intervals)
      const today = new Date()

      // Cria eventos para cada intervalo de revisão
      const events = intervals.map((interval, index) => {
        // Define horário padrão para revisão (ex: 14:00 - 15:00)
        const startDate = setMinutes(setHours(addDays(today, interval), 14), 0)
        const endDate = setMinutes(setHours(addDays(today, interval), 15), 0)

        const event = {
          summary: `Revisão ${index + 1}: ${topic.title}`,
          description: [
            `Revisão ${index + 1} de ${topic.title}`,
            '',
            'Subtópicos:',
            ...topic.subtopics.map(st => `- ${st.title}`)
          ].join('\n'),
          start: {
            dateTime: startDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          calendarId: calendarId,
          colorId: '11', // Roxo
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 30 }
            ]
          }
        }
        console.log(`Evento ${index + 1}:`, event)
        return event
      })

      // Cria os eventos no Google Calendar
      for (const event of events) {
        await createEvent(event)
      }

      return events
    } catch (error) {
      console.error('Erro ao gerar cronograma:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateRevisionSchedule,
    isGenerating
  }
} 