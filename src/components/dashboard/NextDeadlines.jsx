import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { format, isAfter, isBefore, startOfDay, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function NextDeadlines() {
  const { events, isAuthenticated, dashboardCalendars } = useGoogleCalendar()
  const navigate = useNavigate()

  // Filtra e ordena os próximos eventos (próximos 7 dias)
  const upcomingEvents = events
    .filter(event => {
      // Verifica se o calendário do evento está visível no dashboard
      if (!dashboardCalendars.includes(event.calendarId)) {
        return false
      }

      // Ajuste na forma de acessar a data de início do evento
      const eventDate = new Date(event.start instanceof Date ? event.start : event.start.dateTime || event.start.date)
      const today = startOfDay(new Date())
      const nextWeek = addDays(today, 7)
      
      return isAfter(eventDate, today) && isBefore(eventDate, nextWeek)
    })
    .sort((a, b) => {
      const dateA = new Date(a.start instanceof Date ? a.start : a.start.dateTime || a.start.date)
      const dateB = new Date(b.start instanceof Date ? b.start : b.start.dateTime || b.start.date)
      return dateA - dateB
    })
    .slice(0, 5)

  const getEventDateTime = (event) => {
    // Se o evento já é uma data
    if (event.start instanceof Date) {
      return event.start
    }
    // Se o evento tem dateTime (hora específica)
    if (event.start.dateTime) {
      return new Date(event.start.dateTime)
    }
    // Se o evento é de dia inteiro
    return new Date(event.start.date)
  }

  const isAllDayEvent = (event) => {
    return event.start instanceof Date ? false : !event.start.dateTime
  }

  return (
    <Card 
      className="border-l-4 border-l-accent shadow-md hover:bg-accent/10 cursor-pointer transition-colors h-full flex flex-col"
      onClick={() => navigate('/calendar')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-accent" />
          Próximos Prazos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {!isAuthenticated ? (
          <p className="text-sm text-gray-500">
            Conecte seu Google Calendar para ver seus próximos prazos
          </p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum prazo para os próximos 7 dias
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map(event => {
              const eventDate = getEventDateTime(event)
              const isAllDay = isAllDayEvent(event)

              return (
                <div 
                  key={event.id} 
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div 
                    className="w-2 h-2 mt-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: event.calendarColor || '#1a73e8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.summary}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(eventDate, "dd/MM")}
                      {!isAllDay && (
                        <span className="ml-2">
                          {format(eventDate, "HH:mm")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 