import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import GoogleCalendarConnect from '../components/calendar/GoogleCalendarConnect'

export default function Calendar() {
  const [isConnected, setIsConnected] = useState(false)
  const [calendarList, setCalendarList] = useState([])

  // Mapa de cores personalizadas para cada calendário
  const calendarColors = {
    'Provas 111': '#ff0000',      // Vermelho
    'prazos!': '#ff9900',         // Laranja
    'estudo': '#16a765',          // Verde
    'exercício físico': '#7bd148', // Verde limão
    'saúde': '#92e1c0',           // Turquesa
    'pessoal': '#4986e7',         // Azul
    'projetos': '#9a9cff',        // Roxo claro
    'aulas teórica': '#b99aff',   // Roxo
    'MedUfes 111': '#cd74e6',     // Magenta
    'ambulatório': '#f691b2',     // Rosa
    'Turma B': '#c2c2c2'          // Cinza
  }

  const handleGoogleCalendarConnect = async (events, calendars) => {
    if (calendars && calendars.length > 0) {
      console.log('Calendários recebidos:', calendars)
      setCalendarList(calendars)
      setIsConnected(true)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setCalendarList([])
  }

  // Constrói a URL do iframe com todos os calendários
  const buildCalendarUrl = () => {
    if (!calendarList.length) return ''

    const baseUrl = 'https://calendar.google.com/calendar/embed?'
    let url = baseUrl

    // Parâmetros básicos
    url += [
      'wkst=1',
      'bgcolor=%23ffffff',
      'ctz=America/Sao_Paulo',
      'hl=pt_BR',
      'showTitle=0',
      'showNav=1',
      'showDate=1',
      'showPrint=0',
      'showTabs=1',
      'showCalendars=1',
      'showTz=0',
      'mode=MONTH'
    ].join('&')

    // Adiciona cada calendário com sua cor personalizada
    calendarList.forEach(calendar => {
      const encodedId = encodeURIComponent(calendar.id)
      url += `&src=${encodedId}`

      // Usa a cor personalizada se existir, senão mantém a cor padrão
      const customColor = calendarColors[calendar.summary]
      if (customColor) {
        url += `&color=${encodedId}=${customColor.replace('#', '%23')}`
      }
    })

    console.log('URL final do calendário:', url)
    return url
  }

  useEffect(() => {
    if (calendarList.length > 0) {
      console.log('Calendários e suas cores:', calendarList.map(cal => ({
        summary: cal.summary,
        customColor: calendarColors[cal.summary] || 'cor padrão'
      })))
    }
  }, [calendarList])

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendário</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie seus eventos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <GoogleCalendarConnect 
            onConnect={handleGoogleCalendarConnect}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>

      <div className="flex-1 bg-background rounded-lg border shadow-sm p-4">
        {isConnected && calendarList.length > 0 ? (
          <iframe
            key={calendarList.map(cal => cal.id).join(',')} // Força recarregamento ao mudar calendários
            src={buildCalendarUrl()}
            style={{ border: 0 }}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Conecte-se ao Google Calendar para visualizar seus eventos
          </div>
        )}
      </div>
    </div>
  )
} 