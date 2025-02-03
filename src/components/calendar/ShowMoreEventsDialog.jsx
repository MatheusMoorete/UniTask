import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '../ui/dialog'

export function ShowMoreEventsDialog({ date, events, onClose, onEventClick }) {
  const handleEventClick = (event) => {
    onEventClick?.(event)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eventos do dia</DialogTitle>
          <DialogDescription>
            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-2 rounded cursor-pointer hover:bg-gray-100"
              style={{
                borderLeft: `3px solid ${event.color || '#1a73e8'}`,
                backgroundColor: `${event.color}15` || '#e8f0fe'
              }}
              onClick={() => handleEventClick(event)}
              role="button"
              tabIndex={0}
            >
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 