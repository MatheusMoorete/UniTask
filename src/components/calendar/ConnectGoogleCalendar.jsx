import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'

export function ConnectGoogleCalendar() {
  const { handleAuth } = useGoogleCalendar()

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