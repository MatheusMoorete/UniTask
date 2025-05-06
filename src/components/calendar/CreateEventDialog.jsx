// src/components/calendar/CreateEventDialog.jsx

import { useState, useEffect } from 'react'
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
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Plus, Loader2, Download } from 'lucide-react'
import { createICSFile } from '../../utils/calendar'
import { showToast } from '../../lib/toast'
import { format } from 'date-fns'

export function CreateEventDialog({ 
  onEventCreate, 
  onClose, 
  initialDate,
  colors = [],
  calendars = [],
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}) {
  const [isOpen, setIsOpen] = useState(!!externalIsOpen)
  
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen)
    }
  }, [externalIsOpen])

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (externalOnOpenChange) {
      externalOnOpenChange(open)
    }
    if (!open && onClose) {
      onClose()
    }
  }

  const [formError, setFormError] = useState(null)
  const [event, setEvent] = useState({
    title: '',
    start: initialDate ? format(new Date(initialDate), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: initialDate ? format(new Date(new Date(initialDate).getTime() + 60*60*1000), "yyyy-MM-dd'T'HH:mm") : format(new Date(new Date().getTime() + 60*60*1000), "yyyy-MM-dd'T'HH:mm"),
    description: '',
    location: '',
    color: colors.length > 0 ? colors[0].value : '#1a73e8',
    allDay: false,
    calendarId: calendars.length > 0 ? calendars[0].id : null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      // Validar dados
      if (!event.title) {
        setFormError('Título é obrigatório')
        showToast.error('O título do evento é obrigatório')
        setIsSubmitting(false)
        return
      }

      // Preparar dados do evento
      const start = new Date(event.start)
      const end = new Date(event.end)
      
      if (start >= end) {
        setFormError('A data de início deve ser anterior à data de fim')
        showToast.error('A data de início deve ser anterior à data de fim')
        setIsSubmitting(false)
        return
      }

      const eventData = {
        title: event.title,
        start,
        end,
        description: event.description,
        location: event.location,
        color: (calendars.find(c => c.id === event.calendarId)?.color) || '#1a73e8',
        allDay: event.allDay,
        calendarId: event.calendarId
      }

      // Criar o evento no calendário local
      await onEventCreate(eventData)

      showToast.success('Evento criado com sucesso!')
      handleOpenChange(false)
      setEvent({
        title: '',
        start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end: format(new Date(new Date().getTime() + 60*60*1000), "yyyy-MM-dd'T'HH:mm"),
        description: '',
        location: '',
        color: colors.length > 0 ? colors[0].value : '#1a73e8',
        allDay: false,
        calendarId: calendars.length > 0 ? calendars[0].id : null
      })
    } catch (error) {
      console.error('Erro ao criar evento:', error)
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

  const handleAllDayChange = (checked) => {
    if (checked) {
      // Se for evento de dia inteiro, ajustar horários
      const startDate = new Date(event.start)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(event.end)
      endDate.setHours(23, 59, 59, 999)
      
      setEvent({
        ...event,
        allDay: checked,
        start: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        end: format(endDate, "yyyy-MM-dd'T'HH:mm")
      })
    } else {
      setEvent({
        ...event,
        allDay: checked
      })
    }
  }

  const dialogContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Adicionar evento</DialogTitle>
        <DialogDescription>
          Preencha os campos abaixo para adicionar um novo evento ao calendário.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-medium">
            Título*
          </Label>
          <Input
            id="title"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            placeholder="Título do evento"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start" className="font-medium">
              Início*
            </Label>
            <Input
              id="start"
              type="datetime-local"
              value={event.start}
              onChange={(e) => setEvent({ ...event, start: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end" className="font-medium">
              Fim*
            </Label>
            <Input
              id="end"
              type="datetime-local"
              value={event.end}
              onChange={(e) => setEvent({ ...event, end: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="allDay" 
            checked={event.allDay}
            onCheckedChange={handleAllDayChange}
          />
          <Label htmlFor="allDay" className="text-sm font-medium">
            Evento de dia inteiro
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calendar" className="font-medium">
              Agenda
            </Label>
            <Select 
              value={event.calendarId} 
              onValueChange={(value) => setEvent({ ...event, calendarId: value })}
            >
              <SelectTrigger id="calendar">
                <SelectValue placeholder="Escolha uma agenda..." />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <span>{calendar.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="font-medium">
            Local
          </Label>
          <Input
            id="location"
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            placeholder="Local do evento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-medium">
            Descrição
          </Label>
          <Textarea
            id="description"
            value={event.description}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
            placeholder="Descrição do evento"
            rows={3}
          />
        </div>

        {formError && (
          <div className="text-sm font-medium text-red-500">{formError}</div>
        )}
      </div>

      <DialogFooter>
        <div className="flex gap-2 items-center justify-between w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDownloadICS}
            className="flex gap-1.5 items-center"
          >
            <Download className="h-4 w-4" />
            Exportar ICS
          </Button>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  );

  // Se o diálogo for aberto externamente (através de uma prop)
  if (externalIsOpen !== undefined) {
    return dialogContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
} 