import { useState, useEffect } from 'react'
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from "../../lib/utils"

export function CustomCalendar({ selectedDate, onDateSelect }) {
  // Garantir que sempre temos uma data válida para o calendário
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Atualizar a data do calendário quando selectedDate mudar
  useEffect(() => {
    if (selectedDate instanceof Date && !isNaN(selectedDate)) {
      setCalendarDate(selectedDate)
    }
  }, [selectedDate])

  const weekDayNames = [
    { short: 'D', full: 'Domingo' },
    { short: 'S', full: 'Segunda' },
    { short: 'T', full: 'Terça' },
    { short: 'Q', full: 'Quarta' },
    { short: 'Q', full: 'Quinta' },
    { short: 'S', full: 'Sexta' },
    { short: 'S', full: 'Sábado' }
  ]
  
  const firstDayOfMonth = startOfMonth(calendarDate)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const lastDayOfPrevMonth = subDays(firstDayOfMonth, 1)
  
  const daysFromPrevMonth = Array.from({ length: firstDayWeekday }).map((_, i) => {
    const date = subDays(lastDayOfPrevMonth, firstDayWeekday - i - 1)
    return {
      date,
      dayNumber: format(date, 'd'),
      isCurrentMonth: false
    }
  })

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(calendarDate),
    end: endOfMonth(calendarDate)
  }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: true
  }))

  const remainingDays = 42 - (daysFromPrevMonth.length + daysInMonth.length)
  const daysFromNextMonth = Array.from({ length: remainingDays }).map((_, i) => {
    const date = addDays(endOfMonth(calendarDate), i + 1)
    return {
      date,
      dayNumber: format(date, 'd'),
      isCurrentMonth: false
    }
  })

  const allDays = [...daysFromPrevMonth, ...daysInMonth, ...daysFromNextMonth]

  const handlePrevMonth = () => {
    setCalendarDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCalendarDate(prev => addMonths(prev, 1))
  }

  // Função auxiliar para verificar se uma data é igual a selectedDate
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false
    return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd')
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <div className="font-medium">
          {format(calendarDate, "MMM yyyy", { locale: ptBR })}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDayNames.map((day, index) => (
          <div key={`${day.full}-${index}`} className="text-center text-xs text-muted-foreground">
            {day.short}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {allDays.map(({ date, dayNumber, isCurrentMonth }, index) => (
          <button
            key={`${format(date, 'yyyy-MM-dd')}-${index}`}
            onClick={() => onDateSelect(date)}
            className={cn(
              "h-7 w-7 text-center text-sm rounded-sm",
              !isCurrentMonth && "text-muted-foreground/50",
              isSameDate(date, selectedDate) && "bg-primary text-primary-foreground",
              format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && !isSameDate(date, selectedDate) && "border border-primary text-primary",
              "hover:bg-accent"
            )}
          >
            {dayNumber}
          </button>
        ))}
      </div>
    </div>
  )
} 