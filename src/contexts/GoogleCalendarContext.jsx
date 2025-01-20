import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const GoogleCalendarContext = createContext({})

export function GoogleCalendarProvider({ children }) {
  const { user } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gapi, setGapi] = useState(null)
  const [tokenClient, setTokenClient] = useState(null)
  const [events, setEvents] = useState([])
  const [calendars, setCalendars] = useState([])
  const [loading, setLoading] = useState(true)
  const [calendarColors, setCalendarColors] = useState(null)
  const [visibleCalendars, setVisibleCalendars] = useState([])
  const [dashboardCalendars, setDashboardCalendars] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Função para inicializar o cliente GAPI
  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    })
  }

  // Função para obter novo access token usando refresh token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Erro ao atualizar token:', error)
      return null
    }
  }

  // Função para verificar e restaurar a sessão
  const restoreSession = async () => {
    try {
      // Primeiro verifica se já tem um token válido no GAPI
      const currentToken = gapi?.client?.getToken()
      if (currentToken) {
        setIsAuthenticated(true)
        await fetchCalendars()
        return true
      }

      const savedToken = localStorage.getItem('googleCalendarToken')
      if (!savedToken) return false

      const token = JSON.parse(savedToken)
      if (!token?.access_token) return false

      // Se o access token expirou, tenta renovar
      if (new Date(token.expiry_date) <= new Date()) {
        if (!token.refresh_token) {
          localStorage.removeItem('googleCalendarToken')
          return false
        }

        const newAccessToken = await refreshAccessToken(token.refresh_token)
        if (!newAccessToken) {
          localStorage.removeItem('googleCalendarToken')
          return false
        }

        // Atualiza o token no localStorage
        const newToken = {
          ...token,
          access_token: newAccessToken,
          expiry_date: new Date().getTime() + 3600 * 1000, // 1 hora
        }
        localStorage.setItem('googleCalendarToken', JSON.stringify(newToken))
        window.gapi.client.setToken(newToken)
      } else {
        window.gapi.client.setToken(token)
      }

      setIsAuthenticated(true)
      await fetchCalendars()
      return true
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error)
      localStorage.removeItem('googleCalendarToken')
      setIsAuthenticated(false)
      return false
    }
  }

  // Efeito para carregar as APIs do Google
  useEffect(() => {
    const loadGoogleAPIs = async () => {
      try {
        setLoading(true)

        // Carregar GAPI
        if (!window.gapi) {
          const gapiScript = document.createElement('script')
          gapiScript.src = 'https://apis.google.com/js/api.js'
          gapiScript.async = true
          gapiScript.defer = true
          document.head.appendChild(gapiScript)

          await new Promise((resolve) => {
            gapiScript.onload = resolve
          })
        }

        await new Promise((resolve) => window.gapi.load('client', resolve))
        await initializeGapiClient()

        // Carregar GIS
        if (!window.google?.accounts?.oauth2) {
          const gisScript = document.createElement('script')
          gisScript.src = 'https://accounts.google.com/gsi/client'
          gisScript.async = true
          gisScript.defer = true
          document.head.appendChild(gisScript)

          await new Promise((resolve) => {
            gisScript.onload = resolve
          })
        }

        // Configurar cliente OAuth2 com acesso offline
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: import.meta.env.VITE_GOOGLE_CALENDAR_SCOPES,
          prompt: 'consent',
          access_type: 'offline',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              const token = {
                access_token: tokenResponse.access_token,
                refresh_token: tokenResponse.refresh_token,
                expiry_date: new Date().getTime() + (tokenResponse.expires_in * 1000),
                scope: tokenResponse.scope,
                token_type: tokenResponse.token_type
              }

              window.gapi.client.setToken(token)
              localStorage.setItem('googleCalendarToken', JSON.stringify(token))
              setIsAuthenticated(true)
              await fetchCalendars()
            }
          }
        })

        setTokenClient(client)
        setGapi(window.gapi)

        // Tentar restaurar a sessão após inicializar as APIs
        const wasRestored = await restoreSession()
        if (!wasRestored) {
          setIsAuthenticated(false)
        }

        setLoading(false)
      } catch (error) {
        console.error('Erro ao inicializar APIs:', error)
        setLoading(false)
        setIsAuthenticated(false)
      }
    }

    if (user) {
      loadGoogleAPIs()
    }

    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="googleapis"]')
      scripts.forEach(script => script.remove())
    }
  }, [user])

  // Inicializa os calendários visíveis quando os calendários são carregados
  useEffect(() => {
    setVisibleCalendars(calendars.map(cal => cal.id))
    setDashboardCalendars(calendars.map(cal => cal.id))
  }, [calendars])

  // Recarrega eventos quando os calendários visíveis mudam
  useEffect(() => {
    if (calendars.length > 0) {
      fetchEvents(calendars)
    }
  }, [visibleCalendars])

  const fetchCalendarColors = async () => {
    if (!window.gapi?.client?.calendar) return

    try {
      const response = await window.gapi.client.calendar.colors.get()
      setCalendarColors(response.result)
      return response.result
    } catch (error) {
      console.error('Erro ao buscar cores dos calendários:', error)
      return null
    }
  }

  const fetchCalendars = async () => {
    try {
      const response = await window.gapi.client.calendar.calendarList.list()
      const calendars = response.result.items
      setCalendars(calendars)
      await fetchEvents(calendars)
    } catch (error) {
      console.error('Erro ao buscar calendários:', error)
      if (error.status === 401) {
        setIsAuthenticated(false)
      }
    }
  }

  const fetchEvents = async (calendars) => {
    try {
      const allEvents = []
      for (const calendar of calendars) {
        if (!visibleCalendars.includes(calendar.id)) continue

        const response = await window.gapi.client.calendar.events.list({
          calendarId: calendar.id,
          timeMin: new Date().toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
        })
        
        const eventsWithColor = response.result.items.map(event => ({
          ...event,
          calendarId: calendar.id,
          calendarColor: calendar.backgroundColor
        }))
        allEvents.push(...eventsWithColor)
      }
      setEvents(allEvents)
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    }
  }

  const handleAuth = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken()
    }
  }

  const handleSignOut = () => {
    if (!gapi?.client) return
    
    const token = gapi.client.getToken()
    if (token) {
      google.accounts.oauth2.revoke(token.access_token)
      gapi.client.setToken('')
      localStorage.removeItem('googleCalendarToken')
      setIsAuthenticated(false)
      setEvents([])
      setCalendars([])
    }
  }

  const createEvent = async (eventData) => {
    if (!window.gapi?.client?.calendar) return

    try {
      console.log('Criando evento:', eventData) // Log para debug

      const event = {
        summary: eventData.title,
        location: eventData.location,
        description: eventData.description,
        start: {
          dateTime: new Date(eventData.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(eventData.end).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      console.log('Evento formatado:', event) // Log para debug

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: eventData.calendarId,
        resource: event
      })

      console.log('Resposta da API:', response) // Log para debug

      if (response.status === 200) {
        await fetchEvents(calendars)
      } else {
        throw new Error('Falha ao criar evento')
      }
    } catch (error) {
      console.error('Erro detalhado ao criar evento:', {
        message: error.message,
        details: error.details,
        status: error.status,
        result: error.result
      })
      throw error
    }
  }

  const updateEvent = async (eventId, eventData) => {
    if (!window.gapi?.client?.calendar) return

    try {
      const event = {
        summary: eventData.title,
        location: eventData.location,
        description: eventData.description,
        start: {
          dateTime: new Date(eventData.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(eventData.end).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      })

      fetchEvents(calendars)
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
    }
  }

  const deleteEvent = async (eventId) => {
    if (!window.gapi?.client?.calendar) return

    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      })

      fetchEvents(calendars)
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  const toggleCalendarVisibility = (calendarId) => {
    setVisibleCalendars(prev => {
      if (prev.includes(calendarId)) {
        return prev.filter(id => id !== calendarId)
      }
      return [...prev, calendarId]
    })
  }

  const toggleDashboardVisibility = (calendarId) => {
    setDashboardCalendars(prev => {
      if (prev.includes(calendarId)) {
        return prev.filter(id => id !== calendarId)
      }
      return [...prev, calendarId]
    })
  }

  return (
    <GoogleCalendarContext.Provider
      value={{
        isAuthenticated,
        events,
        calendars,
        loading,
        handleAuth,
        handleSignOut,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        visibleCalendars,
        dashboardCalendars,
        toggleCalendarVisibility,
        toggleDashboardVisibility,
      }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  )
}

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext)
  if (!context) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider')
  }
  return context
} 