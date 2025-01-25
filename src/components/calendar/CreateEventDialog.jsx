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
import { capitalizeMonth } from '../../lib/date-utils'

export function CreateEventDialog() {
  const { calendars, createEvent } = useGoogleCalendar()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [event, setEvent] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
    calendarId: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!event.calendarId) {
      setError('Por favor, selecione um calendário')
      return
    }

    try {
      setIsLoading(true)
      
      // Formata o evento para o padrão do Google Calendar
      const formattedEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: new Date(event.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(event.end).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      await createEvent(formattedEvent, event.calendarId)
      setIsOpen(false)
      setEvent({
        title: '',
        start: '',
        end: '',
        description: '',
        location: '',
        calendarId: ''
      })
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      setError(
        error.result?.error?.message || 
        'Erro ao criar evento. Verifique os dados e tente novamente.'
      )
    } finally {
      setIsLoading(false)
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
            <Label htmlFor="calendar">Calendário</Label>
            <Select
              value={event.calendarId}
              onValueChange={(value) => setEvent({ ...event, calendarId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um calendário" />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((calendar) => (
                  <SelectItem 
                    key={calendar.id} 
                    value={calendar.id}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    {calendar.summary}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⭮</span>
                  Criando...
                </>
              ) : (
                'Criar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 