import { useState, useMemo, useEffect, useCallback } from 'react'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Loader2
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateEventDialog } from '../components/calendar/CreateEventDialog'
import { EditEventDialog } from '../components/calendar/EditEventDialog'
import { capitalizeMonth } from '../lib/date-utils'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import { showToast } from '../lib/toast'
import { useSemester } from '../contexts/SemesterContext'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { MonthView } from '../components/calendar/MonthView'
import { CalendarSettings } from '../components/calendar/CalendarSettings'

const VIEW_OPTIONS = [
  { id: 'month', label: 'Mês' },
  { id: 'week', label: 'Semana' },
  { id: 'day', label: 'Dia' }
]

// Cores disponíveis para eventos
const EVENT_COLORS = [
  { id: 'blue', value: '#1a73e8', label: 'Azul' },
  { id: 'green', value: '#0b8043', label: 'Verde' },
  { id: 'red', value: '#d50000', label: 'Vermelho' },
  { id: 'orange', value: '#f4511e', label: 'Laranja' },
  { id: 'purple', value: '#8e24aa', label: 'Roxo' },
  { id: 'teal', value: '#009688', label: 'Turquesa' },
]

export default function Calendar() {
  const { user } = useAuth()
  const { db } = useFirestore()
  const { currentSemester } = useSemester()

  // Estados do calendário
  const [events, setEvents] = useState([])
  const [calendars, setCalendars] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState('month')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [eventToEdit, setEventToEdit] = useState(null)

  // Função para buscar eventos (movida do useEffect para o escopo do componente)
  const fetchEvents = useCallback(async () => {
    if (!user?.uid) {
      setEvents([])
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      
      const eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(eventsQuery)
      const fetchedEvents = []
      
      querySnapshot.forEach((doc) => {
        try {
          const eventData = doc.data()
          
          // Verificar se temos dados de data válidos
          if (!eventData.start || !eventData.end) {
            console.error(`Evento ${doc.id} tem dados de data inválidos:`, eventData)
            return // pular este evento
          }
          
          // Converter Timestamp para Date
          const startDate = eventData.start.toDate ? eventData.start.toDate() : new Date(eventData.start)
          const endDate = eventData.end.toDate ? eventData.end.toDate() : new Date(eventData.end)
          
          // Verificar se as datas convertidas são válidas
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error(`Evento ${doc.id} tem datas inválidas após conversão:`, {
              start: eventData.start,
              end: eventData.end
            })
            return // pular este evento
          }
          
          fetchedEvents.push({
            id: doc.id,
            title: eventData.title,
            start: startDate,
            end: endDate,
            description: eventData.description || '',
            location: eventData.location || '',
            color: eventData.color || '#1a73e8',
            allDay: eventData.allDay || false,
            semesterId: eventData.semesterId || null,
            calendarId: eventData.calendarId || null
          })
        } catch (err) {
          console.error(`Erro ao processar evento ${doc.id}:`, err)
        }
      })
      
      setEvents(fetchedEvents)
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      showToast.error('Não foi possível carregar os eventos')
    } finally {
      setIsLoading(false)
    }
  }, [user, db]);

  // Função para buscar calendários
  const fetchCalendars = useCallback(async () => {
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
          showInDashboard: calendarData.showInDashboard ?? true
        })
      })
      
      // Se não houver calendários, cria um calendário padrão
      if (fetchedCalendars.length === 0) {
        const defaultCalendar = {
          name: 'Meu Calendário',
          color: '#1a73e8',
          showInDashboard: true,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const docRef = await addDoc(collection(db, 'calendars'), defaultCalendar)
        fetchedCalendars.push({
          id: docRef.id,
          ...defaultCalendar
        })
      }
      
      setCalendars(fetchedCalendars)
    } catch (error) {
      console.error('Erro ao buscar calendários:', error)
      showToast.error('Não foi possível carregar os calendários')
    }
  }, [user, db]);

  // Buscar eventos e calendários no Firestore
  useEffect(() => {
    fetchEvents()
    fetchCalendars()
  }, [fetchEvents, fetchCalendars])

  // Formatar os eventos
  const formattedEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }))
  }, [events])

  // Função para criar um novo evento
  const createEvent = async (eventData) => {
    if (!user?.uid) return null
    try {
      const calendarId = eventData.calendarId || null
      // Buscar a cor atual da agenda
      const calendarColor = calendars.find(c => c.id === calendarId)?.color || '#1a73e8'
      const newEvent = {
        ...eventData,
        color: calendarColor,
        userId: user.uid,
        semesterId: currentSemester?.id || null,
        calendarId: calendarId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const docRef = await addDoc(collection(db, 'events'), newEvent)
      setEvents(prev => [...prev, {
        id: docRef.id,
        ...eventData,
        color: calendarColor,
        calendarId
      }])
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      showToast.error('Erro ao criar evento')
      return null
    }
  }

  // Função para atualizar um evento
  const updateEvent = async (eventId, eventData) => {
    if (!user?.uid) return false
    try {
      const calendarId = eventData.calendarId || null
      // Buscar a cor atual da agenda
      const calendarColor = calendars.find(c => c.id === calendarId)?.color || '#1a73e8'
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, {
        ...eventData,
        color: calendarColor,
        updatedAt: new Date()
      })
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, ...eventData, color: calendarColor }
          : event
      ))
      showToast.success('Evento atualizado com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      showToast.error('Erro ao atualizar evento')
      return false
    }
  }

  // Função para excluir um evento
  const deleteEvent = async (eventId) => {
    if (!user?.uid) return false
    
    try {
      await deleteDoc(doc(db, 'events', eventId))
      
      // Remover da lista local
      setEvents(prev => prev.filter(event => event.id !== eventId))
      
      showToast.success('Evento excluído com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      showToast.error('Erro ao excluir evento')
      return false
    }
  }

  // Função para filtrar eventos do dia
  const getEventsForDay = (date) => {
    // Normalizar a data de referência para meia-noite
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    const compareDateStr = compareDate.toISOString().split('T')[0] // YYYY-MM-DD
    
    // Filtrar eventos que ocorrem neste dia
    const dayEvents = formattedEvents.filter(event => {
      try {
        // Normalizar a data do evento para comparação
        const eventDateStart = new Date(event.start)
        eventDateStart.setHours(0, 0, 0, 0)
        const eventDateStartStr = eventDateStart.toISOString().split('T')[0] // YYYY-MM-DD
        
        // Normalizar a data de término do evento para comparação
        const eventDateEnd = new Date(event.end)
        eventDateEnd.setHours(0, 0, 0, 0)
        const eventDateEndStr = eventDateEnd.toISOString().split('T')[0] // YYYY-MM-DD
        
        // Verificar se o evento ocorre no dia da data de referência
        // Um evento ocorre no dia se:
        // 1. A data de início é igual à data de referência, OU
        // 2. A data de término é igual à data de referência, OU
        // 3. A data de referência está entre a data de início e a data de término
        return eventDateStartStr === compareDateStr || 
               eventDateEndStr === compareDateStr || 
               (eventDateStart < compareDate && eventDateEnd > compareDate);
      } catch (err) {
        console.error(`Erro ao filtrar evento para o dia ${compareDateStr}:`, err);
        return false;
      }
    });
    
    return dayEvents;
  }

  // Navegação do calendário
  const handlePrevious = () => {
    switch (currentView) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(subDays(currentDate, 1))
        break
      default:
        setCurrentDate(subDays(currentDate, 1))
    }
  }

  const handleNext = () => {
    switch (currentView) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'day':
        setCurrentDate(addDays(currentDate, 1))
        break
      default:
        setCurrentDate(addDays(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getHeaderTitle = () => {
    let title = ''
    let weekStart, weekEnd
    
    switch (currentView) {
      case 'month':
        title = `${capitalizeMonth(currentDate)} de ${format(currentDate, 'yyyy')}`;
        break;
      case 'week':
        weekStart = startOfWeek(currentDate, { locale: ptBR });
        weekEnd = endOfWeek(currentDate, { locale: ptBR });
        if (format(weekStart, 'MMM') === format(weekEnd, 'MMM')) {
          title = `${format(weekStart, "d")} - ${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
        } else {
          title = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
        }
        break;
      case 'day':
        title = format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
        break;
      default:
        title = '';
    }
    
    return title;
  }

  // Calcular dias do mês para visualização
  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Criar novo calendário
  const handleCreateCalendar = async (calendarData) => {
    try {
      const newCalendar = {
        ...calendarData,
        showInDashboard: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'calendars'), newCalendar)
      
      // Adicionar à lista local
      setCalendars(prev => [...prev, {
        id: docRef.id,
        ...newCalendar
      }])
      
      showToast.success('Calendário criado com sucesso!')
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar calendário:', error)
      showToast.error('Erro ao criar calendário')
      throw error
    }
  }

  // Atualizar calendário
  const handleUpdateCalendar = async (calendarId, data) => {
    try {
      const calendarRef = doc(db, 'calendars', calendarId)
      
      await updateDoc(calendarRef, {
        ...data,
        updatedAt: new Date()
      })
      
      // Atualizar na lista local
      setCalendars(prev => prev.map(calendar => 
        calendar.id === calendarId 
          ? { ...calendar, ...data }
          : calendar
      ))
      
      return true
    } catch (error) {
      console.error('Erro ao atualizar calendário:', error)
      showToast.error('Erro ao atualizar calendário')
      throw error
    }
  }

  // Excluir calendário
  const handleDeleteCalendar = async (calendarId) => {
    try {
      await deleteDoc(doc(db, 'calendars', calendarId))
      
      // Remover da lista local
      setCalendars(prev => (Array.isArray(prev) ? prev.filter(calendar => calendar.id !== calendarId) : []))
      
      // Atualizar eventos associados a este calendário
      const updatedEvents = events.map(event => {
        if (event.calendarId === calendarId) {
          // Atualizar o evento no Firestore para remover a referência ao calendário
          updateDoc(doc(db, 'events', event.id), {
            calendarId: null,
            updatedAt: new Date()
          }).catch(err => console.error('Erro ao atualizar evento:', err))
          
          // Retornar o evento atualizado para o estado local
          return { ...event, calendarId: null }
        }
        return event
      })
      
      setEvents(prev => (Array.isArray(updatedEvents) ? updatedEvents : []))
      
      return true
    } catch (error) {
      console.error('Erro ao excluir calendário:', error)
      showToast.error('Erro ao excluir calendário')
      throw error
    }
  }

  // Importar eventos de arquivos ICS
  const handleImportEvents = async (importedEvents) => {
    if (!importedEvents || importedEvents.length === 0) {
      return
    }
    
    try {
      // Processar cada evento importado
      for (const event of importedEvents) {
        // Garantir que o evento tenha todos os campos necessários
        const eventToCreate = {
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          description: event.description || '',
          location: event.location || '',
          color: event.color || '#1a73e8',
          allDay: event.allDay || false,
          calendarId: event.calendarId || (calendars.length > 0 ? calendars[0].id : null),
          userId: user.uid,
          semesterId: currentSemester?.id || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Criar o evento no Firestore
        await createEvent(eventToCreate)
      }
      
      showToast.success(`${importedEvents.length} eventos importados com sucesso!`)
    } catch (error) {
      console.error('Erro ao importar eventos:', error)
      showToast.error('Erro ao importar eventos')
    }
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
              onClick={handlePrevious}
              className="text-gray-500 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h5 className="text-xl leading-8 font-semibold text-gray-900 min-w-[200px] text-center">
              {getHeaderTitle()}
            </h5>
            <button 
              onClick={handleNext}
              className="text-gray-500 rounded transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Seletor de visão */}
          <div className="flex rounded-md shadow-sm">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setCurrentView(option.id)}
                className={`px-4 py-2 text-sm font-medium ${
                  currentView === option.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  option.id === 'month' ? 'rounded-l-md' : ''
                } ${
                  option.id === 'day' ? 'rounded-r-md' : ''
                } border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <CreateEventDialog 
              onEventCreate={createEvent} 
              colors={EVENT_COLORS} 
              calendars={calendars}
            />
            
            <CalendarSettings 
              events={events} 
              calendars={calendars}
              onCalendarCreate={handleCreateCalendar}
              onCalendarUpdate={handleUpdateCalendar}
              onCalendarDelete={handleDeleteCalendar}
              onImportEvents={handleImportEvents}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="border border-gray-200 rounded-lg flex items-center justify-center h-[480px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="mt-2 text-gray-500">Carregando eventos...</p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg">
          {currentView === 'month' && (
            <MonthView 
              currentDate={currentDate}
              daysInMonth={daysInMonth}
              getEventsForDay={getEventsForDay}
              onEventClick={(event) => setEventToEdit(event)}
              onShowMoreClick={() => {}}
              onAddEventClick={(day) => setSelectedDay(day)}
              onDelete={deleteEvent}
              onUpdate={updateEvent}
              calendars={calendars}
            />
          )}
  
          {currentView === 'week' && (
            <WeekView 
              currentDate={currentDate}
              events={formattedEvents}
              onEventClick={(event) => setEventToEdit(event)}
              onDelete={deleteEvent}
              onUpdate={updateEvent}
              calendars={calendars}
            />
          )}
  
          {currentView === 'day' && (
            <DayView 
              currentDate={currentDate}
              events={formattedEvents}
              onEventClick={(event) => setEventToEdit(event)}
              onDelete={deleteEvent}
              onUpdate={updateEvent}
              calendars={calendars}
            />
          )}
        </div>
      )}

      {/* Diálogo de edição de evento */}
      {eventToEdit && (
        <EditEventDialog
          event={eventToEdit}
          onClose={() => setEventToEdit(null)}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
          colors={EVENT_COLORS}
          calendars={calendars}
        />
      )}
      
      {/* Diálogo para adicionar evento em um dia selecionado */}
      {selectedDay && (
        <CreateEventDialog 
          initialDate={selectedDay}
          onClose={() => setSelectedDay(null)}
          onEventCreate={createEvent}
          colors={EVENT_COLORS}
          calendars={calendars}
        />
      )}
    </div>
  )
} 