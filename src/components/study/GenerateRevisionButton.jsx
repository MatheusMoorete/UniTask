import { Calendar } from 'lucide-react'
import { Button } from '../ui/button'
import { useStudyRevisions } from '../../hooks/useStudyRevisions'
import { useToast } from '../ui/use-toast'
import { useGoogleCalendar } from '../../contexts/GoogleCalendarContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { useState } from 'react'
import PropTypes from 'prop-types'

GenerateRevisionButton.propTypes = {
  topic: PropTypes.shape({
    examDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    subtopics: PropTypes.arrayOf(PropTypes.shape({
      needsRevision: PropTypes.bool
    }))
  }).isRequired,
  id: PropTypes.string
}

export function GenerateRevisionButton({ topic, id }) {
  const { generateRevisionSchedule, isGenerating } = useStudyRevisions()
  const { calendars } = useGoogleCalendar()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCalendarId, setSelectedCalendarId] = useState('')

  const handleGenerateSchedule = async () => {
    if (!topic.examDate) {
      toast({
        title: "Data da prova não definida",
        description: "Defina a data da prova para gerar o cronograma de revisões",
        variant: "destructive"
      })
      return
    }

    const subtopicsToRevise = topic.subtopics.filter(st => st.needsRevision)
    
    if (subtopicsToRevise.length === 0) {
      toast({
        title: "Nenhum tópico para revisar",
        description: "Marque os tópicos que deseja incluir na revisão",
        variant: "destructive"
      })
      return
    }

    if (!selectedCalendarId) {
      toast({
        title: "Calendário não selecionado",
        description: "Selecione um calendário para adicionar os eventos",
        variant: "destructive"
      })
      return
    }

    try {
      await generateRevisionSchedule({
        ...topic,
        subtopics: subtopicsToRevise
      }, selectedCalendarId)
      toast({
        title: "Cronograma gerado!",
        description: "Eventos de revisão foram adicionados ao seu Google Calendar",
        variant: "default"
      })
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao gerar cronograma",
        description: "Verifique se você tem permissão para criar eventos no Google Calendar",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <Button
        id={id}
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={isGenerating || !topic.examDate}
        className="gap-2 hidden"
      >
        <Calendar className="h-4 w-4" />
        {isGenerating ? 'Gerando...' : 'Gerar Cronograma'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Gerar Cronograma de Revisão</DialogTitle>
            <DialogDescription>
              Selecione o calendário onde deseja adicionar os eventos de revisão
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Select
              value={selectedCalendarId}
              onValueChange={setSelectedCalendarId}
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

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateSchedule}
                disabled={!selectedCalendarId || isGenerating}
              >
                {isGenerating ? 'Gerando...' : 'Gerar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 