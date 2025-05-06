import { format, addHours, isToday, isSameDay, startOfWeek, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { EditEventDialog } from './EditEventDialog'

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5) // Começa às 5h e vai até 23h

export function WeekView({ currentDate, events, onDelete, onUpdate }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const weekStart = startOfWeek(currentDate, { locale: ptBR })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return date
  })

  // Função para normalizar as datas dos eventos
  const normalizeEventDates = (event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end)
  })

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleCloseDialog = () => {
    setSelectedEvent(null)
  }

  // Função para verificar se dois eventos se sobrepõem
  const doEventsOverlap = (event1, event2) => {
    return event1.start < event2.end && event2.start < event1.end
  }

  // Função para calcular grupos de eventos sobrepostos
  const getOverlappingGroups = (dayEvents) => {
    const groups = []
    let currentGroup = []

    dayEvents.forEach((event) => {
      if (currentGroup.length === 0) {
        currentGroup.push(event)
      } else {
        const overlapsWithGroup = currentGroup.some(groupEvent => 
          doEventsOverlap(event, groupEvent)
        )

        if (overlapsWithGroup) {
          currentGroup.push(event)
        } else {
          groups.push([...currentGroup])
          currentGroup = [event]
        }
      }
    })

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  return (
    <div className="flex flex-col h-full">
      {selectedEvent && (
        <EditEventDialog 
          event={selectedEvent} 
          onClose={handleCloseDialog}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      )}

      {/* Cabeçalho com horário e dias da semana */}
      <div className="flex border-b border-gray-200">
        {/* Célula vazia para alinhar com a coluna de horários */}
        <div className="w-20 flex-none p-4 bg-gray-50" />

        {/* Dias da semana */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div 
              key={day.toISOString()}
              data-testid={`day-cell-${index}`}
              role="columnheader"
              className={`p-4 text-center border-l first:border-l-0 ${
                isToday(day) ? 'bg-blue-50' : ''
              }`.trim()}
            >
              <div className="text-sm font-medium text-gray-500">
                {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
              </div>
              <div className={`text-xl mt-1 font-medium ${
                isToday(day) ? 'text-blue-600' : 'text-gray-900'
              }`.trim()}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 h-[480px]">
        {/* Coluna de horários */}
        <div 
          data-testid="time-column"
          className="flex-none w-20 border-r border-gray-200 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        >
          <div className="h-4" /> {/* Espaçamento superior */}
          {HOURS.map((hour) => (
            <div 
              key={hour}
              className="h-[60px] relative flex items-center justify-end pr-2 text-xs text-gray-500"
            >
              <span>
                {format(addHours(new Date().setHours(0, 0, 0, 0), hour), 'HH:mm')}
              </span>
            </div>
          ))}
        </div>

        {/* Grade de eventos */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="grid grid-cols-7 relative h-full">
            {weekDays.map((day) => {
              const dayEvents = events
                .map(normalizeEventDates)
                .filter(event => isSameDay(event.start, day))
                .sort((a, b) => a.start.getTime() - b.start.getTime())

              const eventGroups = getOverlappingGroups(dayEvents)

              return (
                <div key={day.toISOString()} className="relative border-l first:border-l-0">
                  <div className="h-4" /> {/* Espaçamento superior */}
                  {/* Linhas de hora */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-100"
                    />
                  ))}

                  {/* Eventos do dia */}
                  {eventGroups.map((group, groupIndex) => 
                    group.map((event, eventIndex) => {
                      const startHour = event.start.getHours()
                      const startMinute = event.start.getMinutes()
                      const duration = (event.end - event.start) / (1000 * 60)
                      const top = ((startHour - 5) * 60 + startMinute)
                      const height = duration
                      const width = `${100 / group.length}%`
                      const left = `${(eventIndex * 100) / group.length}%`

                      return (
                        <div
                          key={event.id}
                          data-testid={`event-${event.id}`}
                          className="absolute rounded overflow-hidden cursor-pointer hover:opacity-90"
                          style={{
                            top: `${top + 16}px`,
                            height: `${height}px`,
                            width,
                            left,
                            borderLeft: `3px solid ${event.color || '#1a73e8'}`,
                            backgroundColor: `${event.color}15` || '#e8f0fe'
                          }}
                          onClick={() => handleEventClick(event)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="p-1 h-full">
                            <div className="text-xs font-medium truncate text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {format(event.start, 'HH:mm')}
                            </div>
                            {event.location && (
                              <div className="text-[10px] text-gray-500 truncate">
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 