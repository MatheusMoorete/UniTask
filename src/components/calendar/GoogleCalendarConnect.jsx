import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'
import { initializeGoogleCalendar, authenticateAndGetEvents, checkSession } from '../../lib/googleCalendar'

export default function GoogleCalendarConnect({ onConnect, onDisconnect }) {
  const [isLoading, setIsLoading] = useState(false)
  const [connectedEmail, setConnectedEmail] = useState(null)

  useEffect(() => {
    const initGoogle = async () => {
      try {
        setIsLoading(true)
        await initializeGoogleCalendar()
        
        // Verifica se a sessão ainda é válida
        const isSessionValid = await checkSession()
        if (isSessionValid) {
          const { events, calendars } = await authenticateAndGetEvents()
          handleConnectionSuccess(events, calendars)
        }
      } catch (error) {
        console.error('Erro ao inicializar Google Calendar:', error)
        // Se houver erro na inicialização, limpa o estado
        handleDisconnect()
      } finally {
        setIsLoading(false)
      }
    }
    initGoogle()
  }, [])

  const handleConnectionSuccess = async (events, calendars) => {
    try {
      // Obtém informações do usuário
      const userResponse = await window.gapi.client.oauth2.userinfo.get()
      setConnectedEmail(userResponse.result.email)
      onConnect(events, calendars)
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error)
      handleDisconnect()
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      const { events, calendars } = await authenticateAndGetEvents()
      handleConnectionSuccess(events, calendars)
    } catch (error) {
      console.error('Erro ao conectar com Google Calendar:', error)
      handleDisconnect()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    // Limpa o token do GAPI
    if (window.gapi?.client?.getToken()) {
      try {
        window.google.accounts.oauth2.revoke(window.gapi.client.getToken().access_token)
      } catch (error) {
        console.error('Erro ao revogar token:', error)
      }
      window.gapi.client.setToken('')
    }

    // Limpa o localStorage
    localStorage.removeItem('googleCalendarToken')

    // Limpa o estado local
    setConnectedEmail(null)

    // Notifica o componente pai
    onDisconnect?.()

    // Apenas recarrega a página se não estiver em ambiente de teste
    if (process.env.NODE_ENV !== 'test') {
      window.location.reload()
    }
  }

  if (connectedEmail) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Conectado como {connectedEmail}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="h-8 px-2"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
    >
      {isLoading ? 'Conectando...' : 'Conectar com Google Calendar'}
    </Button>
  )
} 