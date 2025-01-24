import { Calendar as CalendarIcon, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { CalendarLoading } from './CalendarLoading'

export function ConnectGoogleCalendar() {
  const { handleAuth, handleSignOut, isAuthenticated, loading } = useGoogleCalendar()

  // Mostra o loading enquanto está inicializando
  if (loading) {
    return <CalendarLoading />
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-green-50">
            <CalendarIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Conectado ao Google Calendar
            </h2>
            <p className="text-base text-gray-500 max-w-sm">
              Seus eventos estão sendo sincronizados automaticamente
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button 
            onClick={handleSignOut} 
            variant="outline"
            size="lg" 
            className="gap-2 px-6 text-red-600 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            Desconectar Google Calendar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-blue-50">
          <CalendarIcon className="h-8 w-8 text-blue-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Conecte seu Google Calendar
          </h2>
          <p className="text-base text-gray-500 max-w-sm">
            Sincronize seus eventos e prazos automaticamente com o Google Calendar
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button 
          onClick={handleAuth} 
          size="lg" 
          className="bg-[#4285f4] hover:bg-[#3367d6] text-white gap-2 px-6"
        >
          <img 
            src="/google-calendar-icon.svg" 
            alt="Google Calendar" 
            className="h-5 w-5"
          />
          Conectar Google Calendar
        </Button>
        <p className="text-xs text-gray-500">
          Suas informações estão seguras e você pode desconectar a qualquer momento
        </p>
      </div>
    </div>
  )
} 