import { format, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function MonthView({ currentDate, daysInMonth, getEventsForDay }) {
  return (
    <div className="grid grid-cols-7 divide-x divide-gray-200">
      {daysInMonth.map((day) => {
        const dayEvents = getEventsForDay(day)
        const isCurrentMonth = isSameMonth(day, currentDate)
        
        return (
          <div 
            key={day.toISOString()}
            className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${
              isToday(day) ? 'today' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`calendar-date ${!isCurrentMonth ? 'other-month' : ''} ${
                isToday(day) ? 'today' : ''
              }`}>
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
                  className="event-container"
                  style={{
                    borderLeftColor: event.color || '#1a73e8',
                    backgroundColor: `${event.color}15` || '#e8f0fe'
                  }}
                >
                  {!event.allDay && (
                    <span className="event-time">
                      {format(event.start, 'HH:mm')}
                    </span>
                  )}
                  <div className="event-title">{event.title}</div>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  +{dayEvents.length - 3} mais
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
} 