import { useState, useMemo } from 'react'
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext'
import { Button } from '../components/ui/button'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, Info, LogOut } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateEventDialog } from '../components/calendar/CreateEventDialog'
import { ConnectGoogleCalendar } from '../components/calendar/ConnectGoogleCalendar'
import { EditEventDialog } from '../components/calendar/EditEventDialog'
import { CalendarSettings } from '../components/calendar/CalendarSettings'
import { capitalizeMonth } from '../lib/date-utils'
import { CalendarLoading } from '../components/calendar/CalendarLoading'

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

export default function Calendar() {
  const { 
    isAuthenticated, 
    loading, 
    events,
    handleSignOut,
  } = useGoogleCalendar()

  const [currentDate, setCurrentDate] = useState(new Date())

  // Estado para controlar qual dia está mostrando todos os eventos
  const [expandedDay, setExpandedDay] = useState(null)
  const [eventToEdit, setEventToEdit] = useState(null)

  // Formatação dos eventos
  const formattedEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.summary,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      allDay: !event.start.dateTime,
      color: event.calendarColor
    }))
  }, [events])

  // Função para filtrar eventos do dia
  const getEventsForDay = (date) => {
    return formattedEvents.filter(event => isSameDay(event.start, date))
  }

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))
  }

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))
  }

  // Gera os dias do mês atual
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Mostra o loading enquanto está inicializando
  if (loading) {
    return (
      <div className="h-full p-6">
        <CalendarLoading />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <ConnectGoogleCalendar />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={goToToday}
            className="flex py-2 pl-1.5 pr-3 rounded-md bg-gray-50 border border-gray-300 items-center gap-1.5 text-xs font-medium text-gray-900 transition-all duration-500 hover:bg-gray-100"
          >
            <CalendarIcon className="h-4 w-4" />
            Hoje
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="text-gray-500 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={nextMonth}
              className="text-gray-500 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl leading-8 font-semibold text-gray-900">
              {capitalizeMonth(currentDate)} de {format(currentDate, 'yyyy')}
            </h5>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <CreateEventDialog />
          <div className="flex items-center gap-2">
            <CalendarSettings />
            <span className="w-px h-7 bg-gray-200"></span>
            <button 
              onClick={handleSignOut} 
              className="p-3 text-gray-500 hover:text-gray-900"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200">
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-3.5 flex flex-col items-center">
              <span className="text-sm font-medium text-gray-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isExpanded = expandedDay === day.toISOString()
            const eventsToShow = isExpanded ? dayEvents : dayEvents.slice(0, 2)
            
            return (
              <div 
                key={day.toISOString()}
                className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${
                  isToday(day) ? 'today' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`calendar-date ${!isCurrentMonth ? 'other-month' : ''} ${
                    isToday(day) ? 'today' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {dayEvents.length === 1 ? '1 evento' : `${dayEvents.length} eventos`}
                    </span>
                  )}
                </div>

                <div className="mt-1 space-y-1">
                  {eventsToShow.map((event) => (
                    <div
                      key={event.id}
                      className="event-container cursor-pointer hover:brightness-95"
                      style={{
                        borderLeftColor: event.color || '#1a73e8',
                        backgroundColor: `${event.color}15` || '#e8f0fe'
                      }}
                      onClick={() => setEventToEdit(event)}
                    >
                      {!event.allDay && (
                        <span className="event-time">
                          {format(event.start, 'HH:mm')}
                        </span>
                      )}
                      <div className="event-title">{event.title}</div>
                    </div>
                  ))}
                  {!isExpanded && dayEvents.length > 2 && (
                    <button 
                      onClick={() => setExpandedDay(day.toISOString())}
                      className="text-xs text-blue-600 hover:text-blue-800 w-full text-left"
                    >
                      +{dayEvents.length - 2} mais
                    </button>
                  )}
                  {isExpanded && (
                    <button 
                      onClick={() => setExpandedDay(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 w-full text-left"
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Diálogo de edição */}
      {eventToEdit && (
        <EditEventDialog
          event={eventToEdit}
          onClose={() => setEventToEdit(null)}
        />
      )}
    </div>
  )
} 