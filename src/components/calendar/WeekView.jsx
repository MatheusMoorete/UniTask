import { format, addHours, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { capitalizeMonth } from '../../lib/date-utils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function WeekView({ currentDate, events }) {
  console.log('WeekView - Current date:', currentDate)
  console.log('WeekView - Sample event:', events[0])
  
  const weekStart = startOfWeek(currentDate, { locale: ptBR })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex flex-col h-[800px]">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div 
            key={day.toISOString()} 
            className={`p-2 text-center border-l first:border-l-0 ${
              isToday(day) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="text-xs font-medium text-gray-500">
              {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
            </div>
            <div className={`text-xl mt-1 font-medium ${
              isToday(day) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex">
          {/* Coluna de horários */}
          <div className="w-20 flex-shrink-0">
            <div className="h-14" /> {/* Espaço para alinhar com o cabeçalho */}
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
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 h-full">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="relative border-l first:border-l-0">
                  {/* Linhas de hora */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: `${(hour * 60) / 1.5}px`, height: '40px' }}
                    />
                  ))}

                  {/* Eventos */}
                  {events
                    .filter(event => {
                      // Normalizar as datas para comparação
                      const eventDate = new Date(event.start)
                      eventDate.setHours(0, 0, 0, 0)
                      
                      const compareDate = new Date(day)
                      compareDate.setHours(0, 0, 0, 0)
                      
                      return eventDate.getTime() === compareDate.getTime()
                    })
                    .map((event) => {
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
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-lg font-semibold">
        {capitalizeMonth(startOfWeek)} {format(startOfWeek, 'yyyy')}
      </div>
    </div>
  )
} 