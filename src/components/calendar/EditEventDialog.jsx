import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { format } from 'date-fns'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { capitalizeMonth } from '../../lib/date-utils'

export function EditEventDialog({ event, onClose }) {
  const [editedEvent, setEditedEvent] = useState({
    title: event.title,
    start: format(event.start, "yyyy-MM-dd'T'HH:mm"),
    end: format(event.end, "yyyy-MM-dd'T'HH:mm"),
    location: event.location || '',
    description: event.description || ''
  })

  const { updateEvent, deleteEvent } = useGoogleCalendar()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateEvent(event.id, editedEvent)
    onClose()
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      await deleteEvent(event.id)
      onClose()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias no evento
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={editedEvent.title}
              onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
              placeholder="Digite o título do evento"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Início</Label>
              <Input
                id="start"
                type="datetime-local"
                value={editedEvent.start}
                onChange={(e) => setEditedEvent({ ...editedEvent, start: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Fim</Label>
              <Input
                id="end"
                type="datetime-local"
                value={editedEvent.end}
                onChange={(e) => setEditedEvent({ ...editedEvent, end: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={editedEvent.location}
              onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
              placeholder="Digite a localização (opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={editedEvent.description}
              onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
              placeholder="Digite uma descrição (opcional)"
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 