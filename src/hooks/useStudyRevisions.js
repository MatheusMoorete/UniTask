import { useState } from 'react'
import { addDays, parseISO, setHours, setMinutes, startOfDay, isSameDay, isAfter, differenceInCalendarDays } from 'date-fns'

export function useStudyRevisions() {
  const [isGenerating, setIsGenerating] = useState(false)

  // Função para calcular dias até a prova de forma precisa
  const getDaysUntil = (examDate) => {
    // Garantir que a data de entrada é uma string ou data válida
    if (!examDate) return 0;

    // Criar objetos de data sem informações de hora (só a data)
    const today = startOfDay(new Date());
    
    // Converter a data da prova para objeto Date se for string
    let examDay;
    if (typeof examDate === 'string') {
      // Garantir que a string da data está no formato ISO
      if (examDate.includes('T')) {
        examDay = startOfDay(new Date(examDate));
      } else {
        // Se não tiver informação de hora, é uma data simples (YYYY-MM-DD)
        examDay = startOfDay(new Date(`${examDate}T00:00:00`));
      }
    } else {
      examDay = startOfDay(examDate);
    }

    // Calcular a diferença em dias de calendário (1, 2, 3...)
    const days = differenceInCalendarDays(examDay, today);
    
    // Se negativo, está no passado, então retornar 0
    return days < 0 ? 0 : days;
  };

  // Calcula os intervalos de revisão baseado nos dias até a prova
  const calculateRevisionIntervals = (examDate) => {
    const daysUntilExam = getDaysUntil(examDate)

    // Ajusta os intervalos baseado no tempo disponível
    if (daysUntilExam <= 7) {
      return [1, 3, 5] // Revisões mais frequentes para provas próximas
    } else if (daysUntilExam <= 15) {
      return [2, 5, 10] // Intervalos médios
    } else {
      return [3, 7, 15] // Intervalos padrão para provas distantes
    }
  }

  // Gera eventos de revisão
  const generateRevisionSchedule = async (topic) => {
    try {
      setIsGenerating(true)
      console.log('Gerando cronograma para:', topic)
      const intervals = calculateRevisionIntervals(topic.examDate)
      console.log('Intervalos calculados:', intervals)
      const today = new Date()

      // Garantir que subtopics exista
      const subtopics = topic.subtopics || []

      // Cria eventos para cada intervalo de revisão
      const events = intervals.map((interval, index) => {
        // Define horário padrão para revisão (ex: 14:00 - 15:00)
        const startDate = setMinutes(setHours(addDays(today, interval), 14), 0)
        const endDate = setMinutes(setHours(addDays(today, interval), 15), 0)

        const event = {
          title: `Revisão ${index + 1}: ${topic.title}`,
          description: [
            `Revisão ${index + 1} de ${topic.title}`,
            '',
            'Subtópicos:',
            ...subtopics.map(st => `- ${st.title || 'Sem título'}`)
          ].join('\n'),
          start: startDate,
          end: endDate,
          colorId: '11', // Roxo
        }
        console.log(`Evento ${index + 1}:`, event)
        return event
      })

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