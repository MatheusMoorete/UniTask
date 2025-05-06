import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
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
import { Loader2, Trash, Download } from 'lucide-react'
import { createICSFile } from '../../utils/calendar'
import { showToast } from '../../lib/toast'
import { format } from 'date-fns'

export function EditEventDialog({ 
  event, 
  onClose, 
  onUpdate, 
  onDelete,
  colors = [],
  calendars = []
}) {
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Formatter para datas para o input datetime-local
  const formatDateTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  }

  const [eventData, setEventData] = useState({
    id: event.id,
    title: event.title || '',
    start: formatDateTime(event.start),
    end: formatDateTime(event.end),
    description: event.description || '',
    location: event.location || '',
    allDay: event.allDay || false,
    color: event.color || (colors.length > 0 ? colors[0].value : '#1a73e8'),
    calendarId: event.calendarId || (calendars.length > 0 ? calendars[0].id : null)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      // Validar dados
      if (!eventData.title) {
        setFormError('Título é obrigatório')
        showToast.error('O título do evento é obrigatório')
        setIsSubmitting(false)
        return
      }

      // Preparar dados do evento
      const start = new Date(eventData.start)
      const end = new Date(eventData.end)
      
      if (start >= end) {
        setFormError('A data de início deve ser anterior à data de fim')
        showToast.error('A data de início deve ser anterior à data de fim')
        setIsSubmitting(false)
        return
      }

      const updatedEvent = {
        title: eventData.title,
        start,
        end,
        description: eventData.description,
        location: eventData.location,
        allDay: eventData.allDay,
        color: eventData.color,
        calendarId: eventData.calendarId
      }

      // Atualizar evento local
      await onUpdate(eventData.id, updatedEvent)

      showToast.success('Evento atualizado com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      setFormError('Erro ao atualizar evento')
      showToast.error('Erro ao atualizar evento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      // Excluir evento local
      await onDelete(eventData.id)
      
      showToast.success('Evento excluído com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      showToast.error('Erro ao excluir evento')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadICS = () => {
    try {
      createICSFile({
        title: eventData.title,
        start: eventData.start,
        end: eventData.end,
        description: eventData.description,
        location: eventData.location
      })
    } catch (error) {
      console.error('Erro ao gerar arquivo ICS:', error)
      showToast.error('Erro ao gerar arquivo ICS')
    }
  }

  const handleAllDayChange = (checked) => {
    if (checked) {
      // Se for evento de dia inteiro, ajustar horários
      const startDate = new Date(eventData.start)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(eventData.end)
      endDate.setHours(23, 59, 59, 999)
      
      setEventData({
        ...eventData,
        allDay: checked,
        start: formatDateTime(startDate),
        end: formatDateTime(endDate)
      })
    } else {
      setEventData({
        ...eventData,
        allDay: checked
      })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar evento</DialogTitle>
          <DialogDescription>
            Modifique os detalhes do evento
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="Digite o título do evento"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2 my-4">
            <Checkbox 
              id="allDay" 
              checked={eventData.allDay}
              onCheckedChange={handleAllDayChange}
            />
            <Label htmlFor="allDay" className="text-sm font-medium">Evento de dia inteiro</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Início</Label>
              <Input
                id="start"
                type="datetime-local"
                value={eventData.start}
                onChange={(e) => setEventData({ ...eventData, start: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Fim</Label>
              <Input
                id="end"
                type="datetime-local"
                value={eventData.end}
                onChange={(e) => setEventData({ ...eventData, end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Select
                value={eventData.color}
                onValueChange={(value) => setEventData({ ...eventData, color: value })}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Escolha uma cor..." />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendar">Agenda</Label>
              <Select
                value={eventData.calendarId}
                onValueChange={(value) => setEventData({ ...eventData, calendarId: value })}
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
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              placeholder="Local do evento"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Descrição do evento"
              rows={3}
            />
          </div>

          <DialogFooter className="flex flex-col md:flex-row justify-between w-full gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDownloadICS}
              className="flex items-center gap-2 justify-center w-full md:w-auto"
            >
              <Download className="h-4 w-4" />
              Exportar ICS
            </Button>
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4" /> 
                    Excluir
                  </>
                )}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 