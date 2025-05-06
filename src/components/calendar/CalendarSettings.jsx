import { useState, useEffect } from 'react'
import { Settings, Download, Upload, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs'
import { showToast } from '../../lib/toast'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { createICSFile, parseICSFile } from '../../utils/calendar'
import PropTypes from 'prop-types'
import { addDoc, collection, updateDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { useFirestore } from '../../contexts/FirestoreContext'
import { useAuth } from '../../contexts/AuthContext'

export function CalendarSettings({ 
  events = [], 
  calendars = [], 
  onCalendarCreate, 
  onCalendarUpdate,
  onCalendarDelete,
  onImportEvents 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('agendas')
  const [newCalendarName, setNewCalendarName] = useState('')
  const [newCalendarColor, setNewCalendarColor] = useState('#1a73e8')
  const [importFile, setImportFile] = useState(null)
  const { db } = useFirestore()
  const { user } = useAuth()
  
  // Cores disponíveis para calendários
  const CALENDAR_COLORS = [
    { id: 'blue', value: '#1a73e8', label: 'Azul' },
    { id: 'green', value: '#0b8043', label: 'Verde' },
    { id: 'red', value: '#d50000', label: 'Vermelho' },
    { id: 'orange', value: '#f4511e', label: 'Laranja' },
    { id: 'purple', value: '#8e24aa', label: 'Roxo' },
    { id: 'teal', value: '#009688', label: 'Turquesa' },
  ]

  // Estado para token e agendas do Google
  const [googleToken, setGoogleToken] = useState(null);
  const [googleCalendars, setGoogleCalendars] = useState([]);
  const [selectedGoogleCalendars, setSelectedGoogleCalendars] = useState([]);
  const [isFetchingCalendars, setIsFetchingCalendars] = useState(false);

  // Importar eventos das agendas Google selecionadas
  const [isImportingGoogleEvents, setIsImportingGoogleEvents] = useState(false);

  // Exportar todos os eventos
  const handleExportAllEvents = () => {
    if (events.length === 0) {
      showToast.info('Não há eventos para exportar')
      return
    }
    
    try {
      events.forEach(event => {
        createICSFile({
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description || '',
          location: event.location || ''
        })
      })
      
      showToast.success(`${events.length} eventos exportados para arquivos ICS`)
    } catch (error) {
      console.error('Erro ao exportar eventos:', error)
      showToast.error('Erro ao exportar eventos')
    }
  }
  
  // Exportar eventos de um calendário específico
  const handleExportCalendarEvents = (calendarId) => {
    const calendarEvents = events.filter(event => event.calendarId === calendarId)
    
    if (calendarEvents.length === 0) {
      showToast.info('Não há eventos para exportar neste calendário')
      return
    }
    
    try {
      calendarEvents.forEach(event => {
        createICSFile({
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description || '',
          location: event.location || ''
        })
      })
      
      showToast.success(`${calendarEvents.length} eventos exportados para arquivos ICS`)
    } catch (error) {
      console.error('Erro ao exportar eventos:', error)
      showToast.error('Erro ao exportar eventos')
    }
  }
  
  // Importar eventos de um arquivo ICS
  const handleImportICS = async () => {
    if (!importFile) {
      showToast.error('Selecione um arquivo ICS para importar')
      return
    }
    
    try {
      // Processar arquivo ICS usando nossa nova função
      const importedEvents = await parseICSFile(importFile)
      console.log('Eventos importados do ICS:', importedEvents)
      
      if (importedEvents.length === 0) {
        showToast.info('Nenhum evento encontrado no arquivo')
        return
      }
      
      // Atribuir ID de calendário selecionado
      const selectedCalendarId = document.getElementById('import-calendar-select')?.value
      const eventsWithCalendar = importedEvents.map(event => ({
        ...event,
        calendarId: selectedCalendarId || (calendars.length > 0 ? calendars[0].id : null)
      }))
      
      // Chamar a função de callback para processar os eventos importados
      if (onImportEvents) {
        onImportEvents(eventsWithCalendar)
      }
    } catch (error) {
      console.error('Erro ao importar eventos:', error)
      showToast.error('Erro ao importar o arquivo ICS')
    }
  }
  
  // Criar novo calendário
  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim()) {
      showToast.error('Digite um nome para o calendário')
      return
    }
    
    try {
      const newCalendar = {
        name: newCalendarName.trim(),
        color: newCalendarColor,
        showInDashboard: true,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      if (onCalendarCreate) {
        await onCalendarCreate(newCalendar)
      } else {
        // Implementação padrão se não for fornecida uma função de callback
        const docRef = await addDoc(collection(db, 'calendars'), {
          ...newCalendar,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        showToast.success('Calendário criado com sucesso')
      }
      
      // Limpar campos
      setNewCalendarName('')
      setNewCalendarColor('#1a73e8')
    } catch (error) {
      console.error('Erro ao criar calendário:', error)
      showToast.error('Erro ao criar calendário')
    }
  }
  
  // Atualizar visibilidade no dashboard
  const toggleDashboardVisibility = async (calendarId, currentValue) => {
    try {
      const newValue = !currentValue
      
      if (onCalendarUpdate) {
        await onCalendarUpdate(calendarId, { showInDashboard: newValue })
    } else {
        // Implementação padrão
        const calendarRef = doc(db, 'calendars', calendarId)
        await updateDoc(calendarRef, {
          showInDashboard: newValue,
          updatedAt: new Date()
        })
      }
      
      showToast.success(`Calendário ${newValue ? 'será exibido' : 'não será exibido'} no dashboard`)
    } catch (error) {
      console.error('Erro ao atualizar calendário:', error)
      showToast.error('Erro ao atualizar configurações')
    }
  }
  
  // Excluir calendário e todos os eventos associados
  const handleDeleteCalendar = async (calendarId) => {
    if (!confirm('Tem certeza que deseja excluir este calendário? Todos os eventos associados a ele também serão excluídos.')) {
      return
    }
    if (!user?.uid) {
      showToast.error('Usuário não autenticado. Faça login novamente.');
      return;
    }
    try {
      // Excluir todos os eventos associados a este calendário (apenas do usuário autenticado)
      const eventsQuery = collection(db, 'events');
      const q = query(eventsQuery, where('calendarId', '==', calendarId), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const eventsToDelete = querySnapshot.docs.map(doc => doc.id);
      for (const eventId of eventsToDelete) {
        await deleteDoc(doc(db, 'events', eventId));
      }
      // Remover eventos do estado local
      if (onCalendarDelete) {
        await onCalendarDelete(calendarId)
      } else {
        await deleteDoc(doc(db, 'calendars', calendarId))
      }
      showToast.success('Calendário e eventos associados excluídos com sucesso')
    } catch (error) {
      console.error('Erro ao excluir calendário e eventos:', error)
      showToast.error('Erro ao excluir calendário e eventos')
    }
  }

  // Google Calendar OAuth2 usando Google Identity Services (GIS)
  const handleConnectGoogleCalendar = () => {
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly';

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      alert('Google Identity Services não carregado. Tente novamente em alguns segundos.');
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          setGoogleToken(tokenResponse.access_token);
          fetchGoogleCalendars(tokenResponse.access_token);
        } else {
          alert('Falha ao conectar com Google Calendar');
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  // Buscar agendas do Google Calendar
  const fetchGoogleCalendars = async (token) => {
    setIsFetchingCalendars(true);
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.items) {
        setGoogleCalendars(data.items);
      } else {
        setGoogleCalendars([]);
      }
    } catch (err) {
      setGoogleCalendars([]);
    } finally {
      setIsFetchingCalendars(false);
    }
  };

  // Carregar o script do Google Identity Services (GIS) se não estiver presente
  useEffect(() => {
    if (!window.google || !window.google.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handler para seleção de agendas
  const handleGoogleCalendarCheckbox = (calendarId) => {
    setSelectedGoogleCalendars(prev =>
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  // Importar eventos das agendas Google selecionadas
  const handleImportGoogleEvents = async () => {
    if (!googleToken || selectedGoogleCalendars.length === 0) {
      showToast.error('Selecione pelo menos uma agenda do Google para importar.');
      return;
    }
    setIsImportingGoogleEvents(true);
    try {
      let allEvents = [];
      let googleCalendarIdToUniTaskId = {};
      let uniTaskCalendarIdToColor = {};
      // 1. Para cada agenda selecionada, crie um calendário no UniTask se não existir
      for (const calendarId of selectedGoogleCalendars) {
        const googleCal = googleCalendars.find(c => c.id === calendarId);
        if (!googleCal) continue;
        // Verifica se já existe um calendário com o mesmo nome (ou id Google) no UniTask
        let uniTaskCalendar = calendars.find(c => c.googleCalendarId === calendarId || c.name === googleCal.summary);
        if (!uniTaskCalendar) {
          // Cria o calendário no UniTask
          const newCalendar = {
            name: googleCal.summary,
            color: '#1a73e8', // cor padrão, usuário pode editar depois
            showInDashboard: true,
            userId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            googleCalendarId: calendarId
          };
          let newCalendarId = null;
          if (onCalendarCreate) {
            newCalendarId = await onCalendarCreate(newCalendar);
          } else {
            const docRef = await addDoc(collection(db, 'calendars'), newCalendar);
            newCalendarId = docRef.id;
          }
          googleCalendarIdToUniTaskId[calendarId] = newCalendarId;
          uniTaskCalendarIdToColor[newCalendarId] = newCalendar.color;
        } else {
          googleCalendarIdToUniTaskId[calendarId] = uniTaskCalendar.id;
          uniTaskCalendarIdToColor[uniTaskCalendar.id] = uniTaskCalendar.color;
        }
      }
      // 2. Buscar eventos das agendas selecionadas
      for (const calendarId of selectedGoogleCalendars) {
        let pageToken = undefined;
        do {
          const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=2500${pageToken ? `&pageToken=${pageToken}` : ''}`;
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${googleToken}` }
          });
          const data = await res.json();
          if (data.items) {
            // Associa cada evento ao calendário UniTask criado
            const uniTaskCalendarId = googleCalendarIdToUniTaskId[calendarId];
            const color = uniTaskCalendarIdToColor[uniTaskCalendarId] || '#1a73e8';
            const eventsForThisCalendar = data.items
              .filter(ev => ev.start && (ev.start.dateTime || ev.start.date) && ev.end && (ev.end.dateTime || ev.end.date))
              .map(ev => ({
                title: ev.summary || 'Evento sem título',
                start: ev.start.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start.date),
                end: ev.end.dateTime ? new Date(ev.end.dateTime) : new Date(ev.end.date),
                description: ev.description || '',
                location: ev.location || '',
                allDay: !!ev.start.date,
                calendarId: uniTaskCalendarId,
                color: color,
              }));
            allEvents = allEvents.concat(eventsForThisCalendar);
          }
          pageToken = data.nextPageToken;
        } while (pageToken);
      }
      if (allEvents.length === 0) {
        showToast.info('Nenhum evento válido encontrado nas agendas selecionadas.');
      } else {
        if (onImportEvents) onImportEvents(allEvents);
        showToast.success(`${allEvents.length} eventos importados do Google Calendar!`);
      }
    } catch (err) {
      showToast.error('Erro ao importar eventos do Google Calendar.');
    } finally {
      setIsImportingGoogleEvents(false);
    }
  };

  // Atualizar cor do calendário
  const handleChangeCalendarColor = async (calendar, newColor) => {
    try {
      // Atualizar no Firestore (precisa enviar todos os campos obrigatórios)
      const updatedData = {
        name: calendar.name,
        color: newColor,
        showInDashboard: calendar.showInDashboard,
        userId: calendar.userId || user.uid,
        updatedAt: new Date(),
        createdAt: calendar.createdAt || new Date(),
        ...(calendar.googleCalendarId ? { googleCalendarId: calendar.googleCalendarId } : {})
      };
      if (onCalendarUpdate) {
        await onCalendarUpdate(calendar.id, updatedData);
      } else {
        const calendarRef = doc(db, 'calendars', calendar.id);
        await updateDoc(calendarRef, updatedData);
      }
      showToast.success('Cor da agenda atualizada!');
    } catch (error) {
      showToast.error('Erro ao atualizar cor da agenda');
    }
  };

  // Excluir todos os eventos e agendas do usuário
  const handleDeleteAllCalendarsAndEvents = async () => {
    if (!user?.uid) {
      showToast.error('Usuário não autenticado. Faça login novamente.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir TODOS os eventos e agendas? Esta ação não pode ser desfeita!')) {
      return;
    }
    try {
      // Excluir todos os eventos
      const eventsQuery = query(collection(db, 'events'), where('userId', '==', user.uid));
      const eventsSnapshot = await getDocs(eventsQuery);
      for (const docSnap of eventsSnapshot.docs) {
        await deleteDoc(doc(db, 'events', docSnap.id));
      }
      // Excluir todas as agendas
      const calendarsQuery = query(collection(db, 'calendars'), where('userId', '==', user.uid));
      const calendarsSnapshot = await getDocs(calendarsQuery);
      for (const docSnap of calendarsSnapshot.docs) {
        await deleteDoc(doc(db, 'calendars', docSnap.id));
      }
      // Atualizar estado local
      if (typeof onCalendarDelete === 'function') onCalendarDelete(null);
      showToast.success('Todos os eventos e agendas foram excluídos!');
    } catch (error) {
      showToast.error('Erro ao excluir tudo do calendário.');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="py-2 px-3 text-xs font-medium border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-4 w-4" />
        Configurações
      </Button>
      
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>Configurações do Calendário</DialogTitle>
            <DialogDescription>
              Gerencie suas agendas, importe e exporte eventos
            </DialogDescription>
        </DialogHeader>
          
          {/* Botão de conexão com Google Calendar */}
          <div className="mb-4">
            <Button onClick={handleConnectGoogleCalendar} variant="outline" className="w-full flex items-center gap-2">
              <img src="https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png" alt="Google Calendar" style={{ width: 20, height: 20 }} />
              Conectar com Google Calendar
            </Button>
          </div>
          
          {/* Lista de agendas do Google Calendar para seleção */}
          {googleToken && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Selecione as agendas do Google para importar:</h4>
              {isFetchingCalendars ? (
                <div className="text-sm text-gray-500">Carregando agendas do Google...</div>
              ) : googleCalendars.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma agenda encontrada.</div>
              ) : (
                <>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 mb-2">
                    {googleCalendars.map(calendar => (
                      <label key={calendar.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGoogleCalendars.includes(calendar.id)}
                          onChange={() => handleGoogleCalendarCheckbox(calendar.id)}
                        />
                        <span className="text-sm">{calendar.summary}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    onClick={handleImportGoogleEvents}
                    disabled={isImportingGoogleEvents || selectedGoogleCalendars.length === 0}
                    className="w-full flex items-center gap-2"
                  >
                    {isImportingGoogleEvents ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span> Importando eventos...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Importar eventos selecionados
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
          
          {/* Botão de exclusão total */}
          <div className="mb-4">
            <Button
              variant="destructive"
              className="w-full flex items-center gap-2"
              onClick={handleDeleteAllCalendarsAndEvents}
            >
              <span role="img" aria-label="alerta">⚠️</span>
              Excluir tudo do calendário
            </Button>
          </div>
          
          <Tabs defaultValue="agendas" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="agendas">Agendas</TabsTrigger>
              <TabsTrigger value="importExport">Importar/Exportar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="agendas" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Suas Agendas</h3>
                
                {calendars.length > 0 ? (
                  <div className="space-y-3">
                    {calendars.map(calendar => (
                      <div key={calendar.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {CALENDAR_COLORS.map(color => (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => handleChangeCalendarColor(calendar, color.value)}
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${calendar.color === color.value ? 'border-gray-800 scale-125' : 'border-transparent'}`}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                              >
                                {calendar.color === color.value && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm font-medium">{calendar.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch 
                              id={`dashboard-${calendar.id}`}
                              checked={calendar.showInDashboard}
                              onCheckedChange={() => toggleDashboardVisibility(calendar.id, calendar.showInDashboard)}
                            />
                            <Label htmlFor={`dashboard-${calendar.id}`} className="text-xs">
                              Dashboard
                            </Label>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteCalendar(calendar.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-2">
                    Você ainda não criou nenhuma agenda.
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Criar Nova Agenda</h3>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label htmlFor="calendar-name" className="text-xs mb-1 block">Nome</Label>
                      <Input 
                        id="calendar-name"
                        value={newCalendarName}
                        onChange={e => setNewCalendarName(e.target.value)}
                        placeholder="Ex: Trabalho, Pessoal, Faculdade..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="calendar-color" className="text-xs mb-1 block">Cor</Label>
                      <div className="flex items-center gap-1">
                        {CALENDAR_COLORS.map(color => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setNewCalendarColor(color.value)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              newCalendarColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          >
                            {newCalendarColor === color.value && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </button>
                ))}
              </div>
                    </div>
                    
                    <Button 
                      onClick={handleCreateCalendar}
                      className="mb-0.5"
                    >
                      Criar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="importExport" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Exportar Eventos</h3>
                
                <Button
                  variant="outline"
                  onClick={handleExportAllEvents}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Todos os Eventos (ICS)
                </Button>
                
                {calendars.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500">Exportar por agenda:</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {calendars.map(calendar => (
                        <Button
                          key={calendar.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportCalendarEvents(calendar.id)}
                          className="flex items-center justify-center gap-1.5"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: calendar.color }}
                          />
                          <span className="text-xs truncate">
                            {calendar.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium">Importar Eventos</h3>
                
                <div className="flex flex-col gap-3">
                  <Input
                    type="file"
                    accept=".ics"
                    onChange={e => setImportFile(e.target.files[0])}
                    className="text-sm"
                  />
                  
                  <Button
                    onClick={handleImportICS}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!importFile}
                  >
                    <Upload className="h-4 w-4" />
                    Importar Eventos (ICS)
                  </Button>
                </div>
                
                {calendars.length > 0 && (
                  <div className="pt-2">
                    <Label className="text-xs mb-1 block">
                      Adicionar eventos à agenda:
                    </Label>
                    
                    <select 
                      id="import-calendar-select"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                    >
                      {calendars.map(calendar => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>
    </>
  )
}

CalendarSettings.propTypes = {
  events: PropTypes.array,
  calendars: PropTypes.array,
  onCalendarCreate: PropTypes.func,
  onCalendarUpdate: PropTypes.func,
  onCalendarDelete: PropTypes.func,
  onImportEvents: PropTypes.func
} 