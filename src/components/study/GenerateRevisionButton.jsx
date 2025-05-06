import { Calendar } from 'lucide-react'
import { Button } from '../ui/button'
import { useStudyRevisions } from '../../hooks/useStudyRevisions'
import { useToast } from '../ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { addDoc, collection } from 'firebase/firestore'
import { useFirestore } from '../../contexts/FirestoreContext'
import { useAuth } from '../../contexts/AuthContext'

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
  const { toast } = useToast()
  const { db } = useFirestore()
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleGenerateSchedule = async () => {
    if (!topic.examDate) {
      toast({
        title: "Data da prova não definida",
        description: "Defina a data da prova para gerar o cronograma de revisões",
        variant: "destructive"
      })
      return
    }

    const subtopicsToRevise = (topic.subtopics || []).filter(st => st?.needsRevision)
    
    if (subtopicsToRevise.length === 0) {
      toast({
        title: "Nenhum tópico para revisar",
        description: "Marque os tópicos que deseja incluir na revisão",
        variant: "destructive"
      })
      return
    }

    try {
      // Gerar cronograma de revisão
      const events = await generateRevisionSchedule({
        ...topic,
        subtopics: subtopicsToRevise
      })
      
      // Salvar eventos no calendário local (Firestore)
      for (const event of events) {
        await addDoc(collection(db, 'events'), {
          ...event,
          color: '#9c27b0', // Roxo
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      
      toast({
        title: "Cronograma gerado!",
        description: `${events.length} eventos de revisão foram adicionados ao seu calendário`,
        variant: "default"
      })
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao gerar cronograma",
        description: "Não foi possível criar os eventos de revisão",
        variant: "destructive"
      })
    }
  }

  // Garantir que subtopics exista, usando um array vazio como fallback
  const subtopics = topic.subtopics || []
  // Filtrar os subtópicos que precisam de revisão
  const subtopicsToRevise = subtopics.filter(st => st?.needsRevision)

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
              Isso criará eventos de revisão no seu calendário para os tópicos selecionados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm">
              Serão criados eventos para revisão do tópico: <strong>{topic.title}</strong>
            </p>
            
            {subtopicsToRevise.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-1">Subtópicos para revisão:</p>
                <ul className="text-sm list-disc pl-5">
                  {subtopicsToRevise.map(st => (
                    <li key={st.id || st.title}>{st.title}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-yellow-600">
                Nenhum subtópico selecionado para revisão
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateSchedule}
                disabled={isGenerating || subtopicsToRevise.length === 0}
              >
                {isGenerating ? 'Gerando...' : 'Gerar Revisões'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 