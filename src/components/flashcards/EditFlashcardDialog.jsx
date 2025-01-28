import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useFlashcards } from '../../hooks/useFlashcards'
import { toast } from 'sonner'

export function EditFlashcardDialog({ open, onOpenChange, flashcard }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const { updateFlashcard } = useFlashcards(flashcard?.deckId)

  useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front)
      setBack(flashcard.back)
    }
  }, [flashcard])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!front.trim() || !back.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      await updateFlashcard(flashcard.id, { front, back })
      toast.success('Flashcard atualizado com sucesso!')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error)
      toast.error('Erro ao atualizar flashcard')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Flashcard</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="front">Frente</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Digite a pergunta ou termo..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Verso</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Digite a resposta ou definição..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
