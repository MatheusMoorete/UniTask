//Estrutura da interface de criação de um novo deck (Gestão de decks)

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { useDecks } from '../../hooks/useDecks'
import { showToast } from '../../lib/toast'
import PropTypes from 'prop-types'

export function CreateDeckDialog({ open, onOpenChange }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createDeck } = useDecks()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      showToast.error('O nome do deck é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      await createDeck({ 
        name: name.trim(), 
        description: description.trim(),
        totalCards: 0,
        dueCards: 0
      })
      
      showToast.success('Deck criado com sucesso!')
      setName('')
      setDescription('')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao criar deck:', error)
      showToast.error('Erro ao criar deck')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

CreateDeckDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired
} 