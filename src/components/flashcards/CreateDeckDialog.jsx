//Estrutura da interface de criação de um novo deck (Gestão de decks)

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useDecks } from '../../hooks/useDecks'
import { toast } from 'sonner'

export function CreateDeckDialog({ open, onOpenChange }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { createDeck } = useDecks()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('O nome do deck é obrigatório')
      return
    }

    try {
      await createDeck({ 
        name, 
        description,
        totalCards: 0,
        dueCards: 0
      })
      
      toast.success('Deck criado com sucesso!')
      onOpenChange(false)
      setName('')
      setDescription('')
    } catch (error) {
      console.error('Erro ao criar deck:', error)
      toast.error('Erro ao criar deck')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Matemática Básica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Flashcards sobre operações básicas de matemática"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 