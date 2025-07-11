import { format, addHours, isToday, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { EditEventDialog } from './EditEventDialog'

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5) // Começa às 5h e vai até 23h

export function DayView({ currentDate, events, onDelete, onUpdate }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Função para normalizar as datas dos eventos
  const normalizeEventDates = (event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end)
  })

  // Filtra eventos do dia atual
  const dayEvents = events
    .map(normalizeEventDates)
    .filter(event => isSameDay(event.start, currentDate))
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  const handleCloseDialog = () => {
    setSelectedEvent(null)
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

      {/* Cabeçalho do dia */}
      <div className="flex-none p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-medium text-gray-500">
          {format(currentDate, 'EEEE', { locale: ptBR }).toUpperCase()}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 h-[480px]"> {/* Container fixo de 8 horas */}
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
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative">
          <div className="absolute inset-0">
            <div className="h-4" /> {/* Espaçamento superior */}
            {/* Linhas de hora */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-100"
              />
            ))}

            {/* Eventos */}
            {dayEvents.map((event) => {
              const startHour = event.start.getHours()
              const startMinute = event.start.getMinutes()
              const duration = (event.end - event.start) / (1000 * 60)
              const top = ((startHour - 5) * 60 + startMinute) // Ajusta o top considerando que começa às 5h
              const height = duration

              return (
                <div
                  key={event.id}
                  data-testid={`event-${event.id}`}
                  className="absolute left-2 right-2 rounded overflow-hidden cursor-pointer hover:opacity-90"
                  style={{
                    top: `${top + 16}px`, // Adiciona o espaçamento superior
                    height: `${height}px`,
                    borderLeft: `3px solid ${event.color || '#1a73e8'}`,
                    backgroundColor: `${event.color}15` || '#e8f0fe'
                  }}
                  onClick={() => handleEventClick(event)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="p-2 h-full">
                    <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                    </div>
                    {event.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 