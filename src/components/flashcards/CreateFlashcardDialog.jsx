//Estrutura da interface de criação de um novo flashcard (Gestão de flashcards)

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useFlashcards } from '../../hooks/useFlashcards'
import { showToast } from '../../lib/toast'

export function CreateFlashcardDialog({ open, onOpenChange, deckId }) {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const { createFlashcard } = useFlashcards(deckId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!front.trim() || !back.trim()) {
      showToast.error('Preencha todos os campos')
      return
    }

    try {
      await createFlashcard({ front, back, deckId })
      showToast.success('Flashcard criado com sucesso!')
      onOpenChange(false)
      setFront('')
      setBack('')
    } catch (error) {
      console.error('Erro ao criar flashcard:', error)
      showToast.error('Erro ao criar flashcard. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Flashcard</DialogTitle>
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
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
