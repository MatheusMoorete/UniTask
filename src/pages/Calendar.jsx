import { useState, useMemo, useEffect } from 'react'
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext'
import { Button } from '../components/ui/button'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, Info, LogOut } from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  subDays
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreateEventDialog } from '../components/calendar/CreateEventDialog'
import { ConnectGoogleCalendar } from '../components/calendar/ConnectGoogleCalendar'
import { EditEventDialog } from '../components/calendar/EditEventDialog'
import { CalendarSettings } from '../components/calendar/CalendarSettings'
import { capitalizeMonth } from '../lib/date-utils'
import { CalendarLoading } from '../components/calendar/CalendarLoading'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { MonthView } from '../components/calendar/MonthView'

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const VIEW_OPTIONS = [
  { id: 'month', label: 'Mês' },
  { id: 'week', label: 'Semana' },
  { id: 'day', label: 'Dia' }
]

export default function Calendar() {
  const { 
    isAuthenticated, 
    loading, 
    events,
    handleSignOut,
  } = useGoogleCalendar()

  const { user } = useAuth()
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())

  // Estado para controlar qual dia está mostrando todos os eventos
  const [expandedDay, setExpandedDay] = useState(null)
  const [eventToEdit, setEventToEdit] = useState(null)

  // Formatação dos eventos
  const formattedEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title || event.summary,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay,
      color: event.color || event.calendarColor,
      calendarId: event.calendarId,
      description: event.description,
      location: event.location
    }))
  }, [events])

  // Função para filtrar eventos do dia
  const getEventsForDay = (date) => {
    return formattedEvents
      .filter(event => {
        // Normaliza as datas para comparação
        const eventDate = new Date(event.start)
        eventDate.setHours(0, 0, 0, 0)
        
        const compareDate = new Date(date)
        compareDate.setHours(0, 0, 0, 0)
        
        return eventDate.getTime() === compareDate.getTime()
      })
      .sort((a, b) => {
        // Coloca eventos de dia inteiro primeiro
        if (a.allDay && !b.allDay) return -1
        if (!a.allDay && b.allDay) return 1
        
        // Ordena por horário
        return new Date(a.start).getTime() - new Date(b.start).getTime()
      })
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    switch (currentView) {
      case 'month':
        setCurrentDate(subMonths(newDate, 1))
        break
      case 'week':
        setCurrentDate(subWeeks(newDate, 1))
        break
      case 'day':
        setCurrentDate(subDays(newDate, 1))
        break
    }
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    switch (currentView) {
      case 'month':
        setCurrentDate(addMonths(newDate, 1))
        break
      case 'week':
        setCurrentDate(addWeeks(newDate, 1))
        break
      case 'day':
        setCurrentDate(addDays(newDate, 1))
        break
    }
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'month':
        return `${capitalizeMonth(currentDate)} de ${format(currentDate, 'yyyy')}`
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: ptBR })
        const weekEnd = endOfWeek(currentDate, { locale: ptBR })
        if (format(weekStart, 'MMM') === format(weekEnd, 'MMM')) {
          return `${format(weekStart, "d")} - ${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
        }
        return `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`
      case 'day':
        return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
      default:
        return ''
    }
  }

  // Gera os dias do mês atual
  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Verifica o estado da conexão ao carregar
  useEffect(() => {
    const checkCalendarConnection = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (!userDoc.exists()) {
          // Cria o documento do usuário se não existir
          await setDoc(userDocRef, {
            googleCalendar: {
              connected: false,
              tokens: null,
              expiryDate: null,
              lastSync: null
            }
          })
          setIsCalendarConnected(false)
        } else {
          const userData = userDoc.data()
          if (userData?.googleCalendar?.connected) {
            const tokenExpiryDate = new Date(userData.googleCalendar.expiryDate)
            if (tokenExpiryDate > new Date()) {
              setIsCalendarConnected(true)
              await initializeGoogleCalendarWithToken(userData.googleCalendar.tokens)
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar conexão do calendário:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCalendarConnection()
  }, [user])

  // Função para salvar os tokens no Firestore
  const saveCalendarTokens = async (tokens) => {
    if (!user) return

    try {
      await setDoc(doc(db, 'users', user.uid), {
        googleCalendar: {
          connected: true,
          tokens,
          expiryDate: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          lastSync: new Date().toISOString()
        }
      }, { merge: true })

      setIsCalendarConnected(true)
    } catch (error) {
      console.error('Erro ao salvar tokens:', error)
      throw error
    }
  }

  // Função para desconectar o calendário
  const handleDisconnectCalendar = async () => {
    if (!user) return

    try {
      await setDoc(doc(db, 'users', user.uid), {
        googleCalendar: {
          connected: false,
          tokens: null,
          expiryDate: null,
          lastSync: null
        }
      }, { merge: true })

      setIsCalendarConnected(false)
      // Limpa os tokens locais do Google Calendar
      await clearGoogleCalendarTokens()
    } catch (error) {
      console.error('Erro ao desconectar calendário:', error)
    }
  }

  // Função para conectar o calendário
  const handleConnectCalendar = async () => {
    try {
      setIsLoading(true)
      const tokens = await authenticateWithGoogle()
      await saveCalendarTokens(tokens)
      // Inicializa o cliente do Google Calendar com os novos tokens
      await initializeGoogleCalendarWithToken(tokens)
    } catch (error) {
      console.error('Erro ao conectar calendário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Quando definir o eventToEdit, vamos garantir que tem todas as informações
  const handleEventClick = (event) => {
    if (!event.calendarId) return
    
    setEventToEdit({
      id: event.id,
      title: event.title || event.summary,
      start: event.start,
      end: event.end,
      description: event.description || '',
      location: event.location || '',
      calendarId: event.calendarId,
      color: event.color || event.calendarColor
    })
  }

  const [currentView, setCurrentView] = useState('month')

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
      </div>

      <div className="border border-gray-200 rounded-lg">
        {currentView === 'month' && (
          <MonthView 
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            getEventsForDay={getEventsForDay}
          />
        )}

        {currentView === 'week' && (
          <WeekView 
            currentDate={currentDate}
            events={formattedEvents}
          />
        )}

        {currentView === 'day' && (
          <DayView 
            currentDate={currentDate}
            events={formattedEvents}
          />
        )}
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