import { Calendar as CalendarIcon } from 'lucide-react'

export function CalendarLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-blue-50 animate-pulse">
          <CalendarIcon className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Conectando ao Google Calendar
          </h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-base text-gray-500 max-w-sm">
              Sincronizando seus eventos e calendários
            </p>
            <div className="flex gap-2 items-center">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 