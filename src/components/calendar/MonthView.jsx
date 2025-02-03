import { format, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { capitalizeMonth } from '../../lib/date-utils'
import { useState } from 'react'
import { EditEventDialog } from './EditEventDialog'
import { ShowMoreEventsDialog } from './ShowMoreEventsDialog'

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

export function MonthView({ 
  currentDate, 
  daysInMonth, 
  getEventsForDay,
  onEventClick,
  onShowMoreClick,
  onAddEventClick
}) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showMoreDay, setShowMoreDay] = useState(null)
  const [showMoreEvents, setShowMoreEvents] = useState([])

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    onEventClick?.(event)
  }

  const handleCloseDialog = () => {
    setSelectedEvent(null)
  }

  const handleShowMore = (e, day, events) => {
    e.stopPropagation()
    setShowMoreDay(day)
    setShowMoreEvents(events)
    onShowMoreClick?.(day, events)
  }

  const handleCloseShowMore = () => {
    setShowMoreDay(null)
    setShowMoreEvents([])
  }

  return (
    <div>
      {selectedEvent && (
        <EditEventDialog 
          event={selectedEvent} 
          onClose={handleCloseDialog}
        />
      )}

      {showMoreDay && (
        <ShowMoreEventsDialog
          date={showMoreDay}
          events={showMoreEvents}
          onClose={handleCloseShowMore}
          onEventClick={(event) => {
            setSelectedEvent(event)
            setShowMoreDay(null)
            setShowMoreEvents([])
          }}
        />
      )}

      {/* Cabeçalho com os dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div 
            key={day} 
            data-testid={`weekday-${day}`}
            className="px-3 py-2 text-sm font-medium text-gray-500 text-center border-r last:border-r-0"
          >
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
              data-testid={`day-${format(day, 'M')}-${format(day, 'd')}`}
              className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              } ${isToday(day) ? 'bg-blue-50' : ''}`}
              onClick={() => onAddEventClick?.(day)}
              role="button"
              tabIndex={0}
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
                    data-testid={`event-${event.id}`}
                    className="text-xs p-1 rounded overflow-hidden cursor-pointer hover:bg-gray-100"
                    style={{
                      borderLeft: `3px solid ${event.color || '#1a73e8'}`,
                      backgroundColor: `${event.color}15` || '#e8f0fe'
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                    role="button"
                    tabIndex={0}
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
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 w-full text-left"
                    onClick={(e) => handleShowMore(e, day, dayEvents)}
                  >
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