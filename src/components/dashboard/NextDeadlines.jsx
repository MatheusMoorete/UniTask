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
      // Primeiro verifica se o calendário do evento está visível no dashboard
      if (!dashboardCalendars.includes(event.calendarId)) {
        return false
      }

      const eventDate = new Date(event.start.dateTime || event.start.date)
      const today = startOfDay(new Date())
      const nextWeek = addDays(today, 7)
      
      return isAfter(eventDate, today) && isBefore(eventDate, nextWeek)
    })
    .sort((a, b) => {
      const dateA = new Date(a.start.dateTime || a.start.date)
      const dateB = new Date(b.start.dateTime || b.start.date)
      return dateA - dateB
    })
    .slice(0, 5)

  return (
    <Card 
      className="border-l-4 border-l-accent shadow-md hover:bg-accent/10 cursor-pointer transition-colors"
      onClick={() => navigate('/calendar')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-accent" />
          Próximos Prazos
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            {upcomingEvents.map(event => (
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
                    {format(
                      new Date(event.start.dateTime || event.start.date),
                      event.start.dateTime ? "d 'de' MMMM 'às' HH:mm" : "d 'de' MMMM",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 