import { format, isAfter, isBefore, startOfDay, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useFirestore } from '../../contexts/FirestoreContext'

export function NextDeadlines() {
  const [events, setEvents] = useState([])
  const [calendars, setCalendars] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { db } = useFirestore()
  const navigate = useNavigate()

  // Buscar calendários do usuário
  useEffect(() => {
    const fetchCalendars = async () => {
      if (!user?.uid) {
        setCalendars([])
        return
      }
      
      try {
        const calendarsQuery = query(
          collection(db, 'calendars'),
          where('userId', '==', user.uid)
        )
        
        const querySnapshot = await getDocs(calendarsQuery)
        const fetchedCalendars = []
        
        querySnapshot.forEach((doc) => {
          const calendarData = doc.data()
          fetchedCalendars.push({
            id: doc.id,
            name: calendarData.name,
            color: calendarData.color,
            showInDashboard: calendarData.showInDashboard !== false // Por padrão, mostrar no dashboard
          })
        })
        
        setCalendars(fetchedCalendars)
      } catch (error) {
        console.error('Erro ao buscar calendários:', error)
      }
    }
    
    fetchCalendars()
  }, [user, db])

  // Buscar eventos do Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.uid) {
        setEvents([])
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        
        const today = startOfDay(new Date())
        const nextWeek = addDays(today, 7)
        
        const eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid)
        )
        
        const querySnapshot = await getDocs(eventsQuery)
        const fetchedEvents = []
        
        // IDs dos calendários que devem aparecer no dashboard
        const dashboardCalendarIds = calendars
          .filter(cal => cal.showInDashboard)
          .map(cal => cal.id)
        
        querySnapshot.forEach((doc) => {
          try {
            const eventData = doc.data()
            
            if (!eventData.start) return
            
            // Verificar se o evento pertence a um calendário exibido no dashboard
            if (
              !eventData.calendarId || 
              dashboardCalendarIds.includes(eventData.calendarId) ||
              dashboardCalendarIds.length === 0
            ) {
              const startDate = eventData.start.toDate ? eventData.start.toDate() : new Date(eventData.start)
              
              // Filtrar eventos para os próximos 7 dias
              if (isAfter(startDate, today) && isBefore(startDate, nextWeek)) {
                // Obter a cor do calendário associado, se disponível
                let eventColor = eventData.color || '#1a73e8'
                if (eventData.calendarId) {
                  const associatedCalendar = calendars.find(cal => cal.id === eventData.calendarId)
                  if (associatedCalendar) {
                    eventColor = associatedCalendar.color
                  }
                }
                
                fetchedEvents.push({
                  id: doc.id,
                  title: eventData.title,
                  start: startDate,
                  color: eventColor,
                  allDay: eventData.allDay || false,
                  calendarId: eventData.calendarId,
                  calendarName: eventData.calendarId ? 
                    calendars.find(cal => cal.id === eventData.calendarId)?.name : 
                    'Sem agenda'
                })
              }
            }
          } catch (err) {
            console.error(`Erro ao processar evento ${doc.id}:`, err)
          }
        })
        
        // Ordenar por data
        fetchedEvents.sort((a, b) => a.start - b.start)
        
        setEvents(fetchedEvents.slice(0, 5))
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (calendars.length > 0 || !user) {
      fetchEvents()
    }
  }, [user, db, calendars])

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
        {isLoading ? (
          <p className="text-sm text-gray-500">
            Carregando prazos...
          </p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum prazo para os próximos 7 dias
          </p>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div 
                key={event.id} 
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div 
                  className="w-2 h-2 mt-2 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {format(event.start, "dd/MM")}
                      {!event.allDay && (
                        <span className="ml-1">
                          {format(event.start, "HH:mm")}
                        </span>
                      )}
                    </p>
                    {event.calendarName && (
                      <span className="text-xs text-gray-400 truncate max-w-[100px]">
                        {event.calendarName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 