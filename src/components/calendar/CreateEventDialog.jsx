import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'

export function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  const [event, setEvent] = useState({
    title: '',
    start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    description: '',
    calendarId: 'primary'
  })

  const { createEvent, calendars } = useGoogleCalendar()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    try {
      await createEvent(event)
      setIsOpen(false)
      setEvent({
        title: '',
        start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        location: '',
        description: '',
        calendarId: 'primary'
      })
    } catch (error) {
      setError('Não foi possível criar o evento. Por favor, verifique as permissões da agenda selecionada.')
      console.error('Erro ao criar evento:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Criar evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar novo evento</DialogTitle>
          <DialogDescription>
            Adicione os detalhes do seu novo evento no calendário
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              placeholder="Digite o título do evento"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calendar">Minhas Agendas Google</Label>
            <Select
              value={event.calendarId}
              onValueChange={(value) => setEvent({ ...event, calendarId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma agenda" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {calendars.map((calendar) => (
                  <SelectItem 
                    key={calendar.id} 
                    value={calendar.id}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <span className="truncate">{calendar.summary}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Início</Label>
              <Input
                id="start"
                type="datetime-local"
                value={event.start}
                onChange={(e) => setEvent({ ...event, start: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Fim</Label>
              <Input
                id="end"
                type="datetime-local"
                value={event.end}
                onChange={(e) => setEvent({ ...event, end: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={event.location}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
              placeholder="Digite a localização (opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              placeholder="Digite uma descrição (opcional)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 