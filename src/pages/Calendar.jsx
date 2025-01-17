import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { Card, CardContent } from '../components/ui/card';
import { AddEventDialog } from '../components/calendar/AddEventDialog';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Calendar as CalendarIcon, Plus, RefreshCcw } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import '../styles/calendar.css';

const GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const { currentUser } = useAuth();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleAccessToken(tokenResponse.access_token);
      setGoogleCalendarConnected(true);
      localStorage.setItem('googleCalendarConnected', 'true');
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  useEffect(() => {
    const isConnected = localStorage.getItem('googleCalendarConnected') === 'true';
    setGoogleCalendarConnected(isConnected);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'events'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start.toDate(),
        end: doc.data().end.toDate(),
        backgroundColor: doc.data().backgroundColor,
        borderColor: doc.data().borderColor,
        allDay: true,
      }));
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDateSelect = (selectInfo) => {
    setSelectedDates({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setShowAddEventDialog(true);
  };

  const handleEventClick = async (clickInfo) => {
    // Não permitir deletar eventos do Google Calendar
    if (clickInfo.event.source?.sourceId === 'googleCalendar') {
      return;
    }

    if (window.confirm('Deseja remover este evento?')) {
      try {
        await deleteDoc(doc(db, 'events', clickInfo.event.id));
      } catch (error) {
        console.error('Erro ao remover evento:', error);
      }
    }
  };

  const handleAddEvent = async (eventData) => {
    if (!currentUser || !selectedDates) return;

    const { title, type } = eventData;
    const { start, end } = selectedDates;

    let backgroundColor;
    switch (type) {
      case 'exam':
        backgroundColor = '#dc2626';
        break;
      case 'assignment':
        backgroundColor = '#eab308';
        break;
      case 'task':
        backgroundColor = '#2563eb';
        break;
      default:
        backgroundColor = '#8b5cf6';
    }

    try {
      const newEvent = {
        title,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
        type,
        backgroundColor,
        borderColor: backgroundColor,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        allDay: true,
      };

      await addDoc(collection(db, 'events'), newEvent);
      setShowAddEventDialog(false);
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    setGoogleCalendarConnected(false);
    setGoogleAccessToken(null);
    localStorage.removeItem('googleCalendarConnected');
  };

  return (
    <div className="calendar-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus eventos e prazos acadêmicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!googleCalendarConnected ? (
            <Button
              variant="outline"
              onClick={() => login()}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Conectar Google Calendar
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleDisconnectGoogleCalendar}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Reconectar Google Calendar
            </Button>
          )}
          <Button onClick={() => setShowAddEventDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              googleCalendarPlugin
            ]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            initialView="dayGridMonth"
            editable={false}
            selectable={true}
            selectMirror={false}
            dayMaxEvents={3}
            weekends={true}
            events={events}
            googleCalendarApiKey={GOOGLE_CALENDAR_API_KEY}
            eventSources={[
              ...(googleCalendarConnected ? [{
                googleCalendarId: 'primary',
                className: 'google-calendar-event',
                color: '#047857',
              }] : []),
              events
            ]}
            select={handleDateSelect}
            eventClick={handleEventClick}
            locale="pt-br"
            height="100%"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: false,
            }}
            slotMinTime="07:00:00"
            slotMaxTime="23:00:00"
          />
        </CardContent>
      </Card>

      <AddEventDialog
        isOpen={showAddEventDialog}
        onClose={() => setShowAddEventDialog(false)}
        onSave={handleAddEvent}
        selectedDates={selectedDates}
      />
    </div>
  );
} 