import { format, addHours, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function DayView({ currentDate, events }) {
  console.log('DayView - Current date:', currentDate)
  console.log('DayView - Sample event:', events[0])
  
  // Filtre os eventos do dia atual
  const dayEvents = events.filter(event => {
    // Normalizar as datas para comparação
    const eventDate = new Date(event.start)
    eventDate.setHours(0, 0, 0, 0)
    
    const compareDate = new Date(currentDate)
    compareDate.setHours(0, 0, 0, 0)
    
    return eventDate.getTime() === compareDate.getTime()
  })
  
  console.log('DayView filtered events:', dayEvents)

  return (
    <div className="flex flex-col h-[800px]">
      {/* Cabeçalho do dia */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="text-sm font-medium text-gray-500">
          {format(currentDate, 'EEEE', { locale: ptBR }).toUpperCase()}
        </div>
        <div className="text-2xl font-medium text-gray-900">
          {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Coluna de horários */}
        <div className="w-20 flex-shrink-0">
          <div className="relative h-full">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="absolute w-full border-t border-gray-200 text-xs text-gray-500 -mt-2.5"
                style={{ top: `${(hour * 60) / 1.5}px` }}
              >
                <span className="relative -top-2 ml-2">
                  {format(addHours(new Date().setHours(0, 0, 0, 0), hour), 'HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grade de eventos */}
        <div className="flex-1 relative border-l">
          {/* Linhas de hora */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full border-t border-gray-200"
              style={{ top: `${(hour * 60) / 1.5}px`, height: '40px' }}
            />
          ))}

          {/* Eventos */}
          {dayEvents.map((event) => {
            const startHour = event.start.getHours()
            const startMinute = event.start.getMinutes()
            const duration = (event.end - event.start) / (1000 * 60)

            return (
              <div
                key={event.id}
                className="absolute left-1 right-1 rounded overflow-hidden"
                style={{
                  top: `${((startHour * 60 + startMinute)) / 1.5}px`,
                  height: `${duration / 1.5}px`,
                  backgroundColor: event.color || '#1a73e8',
                }}
              >
                <div className="p-1 text-white">
                  <div className="text-xs font-medium truncate">
                    {event.title}
                  </div>
                  <div className="text-[10px] opacity-90">
                    {format(event.start, 'HH:mm')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 