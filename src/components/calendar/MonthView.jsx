import { format, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { capitalizeMonth } from '../../lib/date-utils'

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

export function MonthView({ currentDate, daysInMonth, getEventsForDay }) {
  return (
    <div>
      {/* Cabeçalho com os dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-3 py-2 text-sm font-medium text-gray-500 text-center border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          
          return (
            <div 
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              } ${isToday(day) ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                } ${isToday(day) ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-xs text-gray-500">{dayEvents.length} eventos</span>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded overflow-hidden cursor-pointer"
                    style={{
                      borderLeft: `3px solid ${event.color || '#1a73e8'}`,
                      backgroundColor: `${event.color}15` || '#e8f0fe'
                    }}
                  >
                    {!event.allDay && (
                      <span className="text-gray-500 mr-1">
                        {format(event.start, 'HH:mm')}
                      </span>
                    )}
                    <span className="font-medium truncate">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                    +{dayEvents.length - 3} mais
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 