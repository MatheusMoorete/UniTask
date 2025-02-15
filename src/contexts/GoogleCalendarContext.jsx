import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { showToast } from '../lib/toast'

const GoogleCalendarContext = createContext({})

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000 // 50 minutos

export function GoogleCalendarProvider({ children }) {
  const { user } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [gapi, setGapi] = useState(null)
  const [tokenClient, setTokenClient] = useState(null)
  const [events, setEvents] = useState([])
  const [calendars, setCalendars] = useState([])
  const [loading, setLoading] = useState(true)
  const [calendarColors, setCalendarColors] = useState(null)
  const [visibleCalendars, setVisibleCalendars] = useState(() => {
    const saved = localStorage.getItem('visibleCalendars')
    return saved ? JSON.parse(saved) : []
  })
  const [dashboardCalendars, setDashboardCalendars] = useState(() => {
    const saved = localStorage.getItem('dashboardCalendars')
    return saved ? JSON.parse(saved) : []
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [gapiInited, setGapiInited] = useState(false)
  const [error, setError] = useState(null)
  const [accessToken, setAccessToken] = useState(() => {
    const savedToken = localStorage.getItem('googleCalendarToken')
    return savedToken ? JSON.parse(savedToken).accessToken : null
  })

  // Função para salvar o token após autenticação bem-sucedida
  const saveAccessToken = (token, refreshToken) => {
    try {
      const tokenData = {
        accessToken: token,
        refreshToken: refreshToken,
        expiryDate: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hora
        lastRefresh: new Date().toISOString()
      }
      localStorage.setItem('googleCalendarToken', JSON.stringify(tokenData))
      setAccessToken(token)
      
      // Configura o token no cliente GAPI
      if (window.gapi?.client) {
        window.gapi.client.setToken({ access_token: token })
      }
    } catch (error) {
      console.error('Erro ao salvar token:', error)
      showToast.error('Erro ao salvar credenciais do Google Calendar')
    }
  }

  // Função para limpar o token e estado
  const clearAccessToken = () => {
    try {
      localStorage.removeItem('googleCalendarToken')
      localStorage.removeItem('visibleCalendars')
      localStorage.removeItem('dashboardCalendars')
      
      if (window.gapi?.client) {
        window.gapi.client.setToken(null)
      }
      
      setAccessToken(null)
      setIsAuthenticated(false)
      setEvents([])
      setCalendars([])
      setVisibleCalendars([])
      setDashboardCalendars([])
      
      showToast.success('Desconectado do Google Calendar com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar tokens:', error)
      showToast.error('Erro ao desconectar do Google Calendar')
    }
  }

  // Função para obter novo access token usando refresh token
  const refreshAccessToken = async (refreshToken) => {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

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
        }).toString(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error_description || 'Erro ao atualizar token')
      }

      const data = await response.json()
      
      if (!data.access_token) {
        throw new Error('Token de acesso não recebido')
      }

      return data.access_token
    } catch (error) {
      console.error('Erro ao atualizar token:', error)
      showToast.error('Erro ao renovar acesso ao Google Calendar')
      clearAccessToken() // Limpa os tokens em caso de erro
      return null
    }
  }

  // Função para verificar e restaurar a sessão com retry
  const restoreSession = async (retryCount = 3) => {
    try {
      const savedTokenData = localStorage.getItem('googleCalendarToken')
      if (!savedTokenData) {
        setLoading(false)
        return false
      }

      const { accessToken, refreshToken, expiryDate } = JSON.parse(savedTokenData)
      const isExpired = new Date(expiryDate) <= new Date()

      if (isExpired || !accessToken) {
        if (!refreshToken) {
          clearAccessToken()
          return false
        }

        const newAccessToken = await refreshAccessToken(refreshToken)
        if (!newAccessToken) {
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return restoreSession(retryCount - 1)
          }
          clearAccessToken()
          return false
        }

        saveAccessToken(newAccessToken, refreshToken)
      }

      // Inicializa o cliente GAPI se necessário
      if (!window.gapi?.client) {
        await initializeGapiClient()
      }

      // Configura o token atual
      window.gapi.client.setToken({ access_token: accessToken })

      try {
        // Testa a conexão
        await window.gapi.client.calendar.calendarList.list({ maxResults: 1 })
        setIsAuthenticated(true)
        await fetchCalendars()
        setLoading(false)
        return true
      } catch (error) {
        if (error.status === 401 && retryCount > 0) {
          const newAccessToken = await refreshAccessToken(refreshToken)
          if (newAccessToken) {
            saveAccessToken(newAccessToken, refreshToken)
            return restoreSession(retryCount - 1)
          }
        }
        throw error
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error)
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return restoreSession(retryCount - 1)
      }
      clearAccessToken()
      return false
    }
  }

  // Efeito para atualizar o token periodicamente
  useEffect(() => {
    let refreshInterval

    if (isAuthenticated) {
      refreshInterval = setInterval(async () => {
        const tokenData = JSON.parse(localStorage.getItem('googleCalendarToken'))
        if (tokenData?.refreshToken) {
          const newAccessToken = await refreshAccessToken(tokenData.refreshToken)
          if (newAccessToken) {
            saveAccessToken(newAccessToken, tokenData.refreshToken)
          }
        }
      }, TOKEN_REFRESH_INTERVAL)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [isAuthenticated])

  // Função para inicializar o cliente GAPI
  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    })
  }

  // Configurar cliente OAuth2 com escopo para refresh token
  const configureTokenClient = () => {
    return window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES.join(' '),
      prompt: 'consent',
      access_type: 'offline',
      callback: async (response) => {
        if (response.error) {
          console.error('Erro na autenticação:', response.error)
          showToast.error('Erro ao conectar com o Google Calendar')
          return
        }

        if (response.access_token) {
          saveAccessToken(response.access_token, response.refresh_token)
          setIsAuthenticated(true)
          await fetchCalendars()
          showToast.success('Conectado ao Google Calendar com sucesso!')
        }
      },
    })
  }

  // Efeito para carregar as APIs do Google e restaurar a sessão
  useEffect(() => {
    const loadGoogleAPIs = async () => {
      try {
        setLoading(true)

        // Carregar GAPI se necessário
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

        // Carregar cliente GAPI
        if (!window.gapi.client) {
          await new Promise((resolve) => window.gapi.load('client', resolve))
          await initializeGapiClient()
        }

        // Carregar GIS se necessário
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

        // Configurar cliente OAuth2
        const client = configureTokenClient()
        setTokenClient(client)
        setGapi(window.gapi)

        // Tentar restaurar a sessão
        await restoreSession()
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

  // Salva as preferências de visibilidade quando mudam
  useEffect(() => {
    if (visibleCalendars.length > 0) {
      localStorage.setItem('visibleCalendars', JSON.stringify(visibleCalendars))
    }
  }, [visibleCalendars])

  useEffect(() => {
    if (dashboardCalendars.length > 0) {
      localStorage.setItem('dashboardCalendars', JSON.stringify(dashboardCalendars))
    }
  }, [dashboardCalendars])

  // Atualiza os calendários visíveis apenas se não houver configuração salva
  useEffect(() => {
    if (calendars.length > 0 && visibleCalendars.length === 0) {
      setVisibleCalendars(calendars.map(cal => cal.id))
    }
    if (calendars.length > 0 && dashboardCalendars.length === 0) {
      setDashboardCalendars(calendars.map(cal => cal.id))
    }
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

  const fetchEvents = async (calendarsToFetch = null) => {
    try {
      const allEvents = []
      const calendarsToUse = calendarsToFetch || calendars

      if (!Array.isArray(calendarsToUse)) {
        console.warn('Nenhum calendário disponível para buscar eventos')
        return
      }

      for (const calendar of calendarsToUse) {
        if (!visibleCalendars.includes(calendar.id)) continue

        const response = await window.gapi.client.calendar.events.list({
          calendarId: calendar.id,
          timeMin: new Date().toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
        })

        if (!response.result.items) continue

        const eventsWithMetadata = response.result.items.map(event => ({
          id: event.id,
          title: event.summary,
          summary: event.summary,
          start: event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date),
          end: event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date),
          allDay: !event.start.dateTime,
          calendarId: calendar.id,
          calendarColor: calendar.backgroundColor,
          color: calendar.backgroundColor,
          description: event.description || '',
          location: event.location || '',
          originalEvent: event
        }))

        allEvents.push(...eventsWithMetadata)
      }

      setEvents(allEvents)
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
    }
  }

  // Função de autenticação atualizada
  const handleAuth = async () => {
    try {
      if (!tokenClient) {
        throw new Error('Cliente de autenticação não inicializado')
      }

      tokenClient.callback = async (response) => {
        if (response.access_token) {
          saveAccessToken(response.access_token, response.refresh_token);
          setIsAuthenticated(true)
          await fetchCalendars()
        }
      }

      tokenClient.requestAccessToken({ prompt: 'consent' })
    } catch (error) {
      console.error('Erro na autenticação:', error)
      setError('Falha na autenticação com o Google Calendar')
    }
  }

  // Função de logout atualizada
  const handleSignOut = async () => {
    try {
      if (gapi?.client) {
        const token = gapi.client.getToken()
        if (token !== null) {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${token.access_token}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        }
      }
      clearAccessToken()
    } catch (error) {
      console.error('Erro ao desconectar:', error)
      showToast.error('Erro ao desconectar do Google Calendar')
    }
  }

  const createEvent = async (eventData, calendarId) => {
    try {
      if (!window.gapi?.client?.calendar) {
        throw new Error('Cliente do Google Calendar não inicializado')
      }

      if (!calendarId) {
        throw new Error('ID do calendário não fornecido')
      }

      const event = {
        summary: eventData.summary,
        location: eventData.location || '',
        description: eventData.description || '',
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: eventData.start.timeZone
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: eventData.end.timeZone
        }
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: event,
      })

      // Atualiza a lista de eventos usando os calendários atuais
      await fetchEvents(calendars)
      return response.result
    } catch (error) {
      console.error('Erro detalhado ao criar evento:', error)
      const errorMessage = error.result?.error?.message || 'Erro desconhecido'
      throw new Error('Erro ao criar evento: ' + errorMessage)
    }
  }

  const updateEvent = async (eventId, eventData, calendarId) => {
    if (!window.gapi?.client?.calendar) {
      throw new Error('Cliente do Google Calendar não inicializado')
    }

    try {
      // Verifica se temos o calendarId, se não usa 'primary'
      const targetCalendarId = calendarId || 'primary'

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

      const response = await window.gapi.client.calendar.events.update({
        calendarId: targetCalendarId,
        eventId: eventId,
        resource: event
      })

      // Atualiza a lista de eventos
      await fetchEvents(calendars)
      return response.result
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      throw new Error('Não foi possível atualizar o evento. Tente novamente.')
    }
  }

  const deleteEvent = async (eventId, calendarId) => {
    if (!window.gapi?.client?.calendar) {
      throw new Error('Cliente do Google Calendar não inicializado')
    }

    try {
      if (!calendarId) {
        throw new Error('ID do calendário não fornecido')
      }

      const response = await window.gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId
      })

      await fetchEvents(calendars)
      return response
    } catch (error) {
      throw new Error(
        error.result?.error?.message || 
        'Não foi possível excluir o evento. Tente novamente.'
      )
    }
  }

  const toggleCalendarVisibility = (calendarId) => {
    setVisibleCalendars(prev => {
      const newVisibleCalendars = prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
      
      localStorage.setItem('visibleCalendars', JSON.stringify(newVisibleCalendars))
      return newVisibleCalendars
    })
  }

  const toggleDashboardVisibility = (calendarId) => {
    setDashboardCalendars(prev => {
      const newDashboardCalendars = prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
      
      localStorage.setItem('dashboardCalendars', JSON.stringify(newDashboardCalendars))
      return newDashboardCalendars
    })
  }

  return (
    <GoogleCalendarContext.Provider
      value={{
        isAuthenticated,
        loading,
        error,
        events,
        calendars,
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