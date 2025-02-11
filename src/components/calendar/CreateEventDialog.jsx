// src/components/calendar/CreateEventDialog.jsx

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
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
import { Plus, Loader2 } from 'lucide-react'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import { createICSFile } from '../../utils/calendar'
import { showToast } from '../../lib/toast'

export function CreateEventDialog() {
  const { isAuthenticated, createEvent, calendars, isLoading: isGoogleLoading } = useGoogleCalendar()
  const [isOpen, setIsOpen] = useState(false)
  const [formError, setFormError] = useState(null)
  const [event, setEvent] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
    calendarId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted')
    setFormError(null)
    setIsSubmitting(true)

    if (!event.title) {
      console.log('Title validation failed')
      setFormError('Título é obrigatório')
      showToast.error('O título do evento é obrigatório')
      setIsSubmitting(false)
      return
    }

    if (isAuthenticated && !event.calendarId) {
      console.log('Calendar validation failed')
      setFormError('Por favor, selecione um calendário')
      showToast.error('Selecione um calendário')
      setIsSubmitting(false)
      return
    }

    try {
      if (isAuthenticated) {
        console.log('Trying to create event...')
        await createEvent({
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
        }, event.calendarId)

        console.log('Event created successfully')
        showToast.success('Evento criado com sucesso!')
        setIsOpen(false)
        setEvent({
          title: '',
          start: '',
          end: '',
          description: '',
          location: '',
          calendarId: ''
        })
      }
    } catch (error) {
      console.log('Error caught in handleSubmit:', error)
      setFormError('Erro ao criar evento')
      showToast.error('Erro ao criar evento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadICS = () => {
    if (!event.title || !event.start || !event.end) {
      setFormError('Preencha pelo menos título, data de início e fim')
      return
    }
    
    createICSFile({
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.description,
      location: event.location
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Criar Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-hidden={false}>
        <DialogHeader>
          <DialogTitle>Novo evento</DialogTitle>
          <DialogDescription>
            Adicione os detalhes do seu novo evento no calendário
          </DialogDescription>
        </DialogHeader>
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          role="form"
          aria-label="Formulário de novo evento"
        >
          {(formError) && (
            <div 
              className="text-sm text-red-500 bg-red-50 p-2 rounded" 
              role="alert"
              data-testid="error-message"
            >
              {formError}
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
          {isAuthenticated && (
            <div className="space-y-2">
              <Label htmlFor="calendar">Calendário</Label>
              <Select
                value={event.calendarId}
                onValueChange={(value) => setEvent({ ...event, calendarId: value })}
                required
              >
                <SelectTrigger className="w-full" role="combobox" aria-label="Selecione um calendário">
                  <SelectValue placeholder="Selecione um calendário" />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem 
                      key={calendar.id} 
                      value={calendar.id}
                      role="option"
                      aria-selected={event.calendarId === calendar.id}
                    >
                      {calendar.summary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
          <div className="sm:justify-end sm:space-x-2 flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              aria-label={isSubmitting ? "Carregando..." : "Criar Evento"}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Carregando...</span>
                </>
              ) : (
                'Criar Evento'
              )}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleDownloadICS}
            >
              Baixar arquivo .ics
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 