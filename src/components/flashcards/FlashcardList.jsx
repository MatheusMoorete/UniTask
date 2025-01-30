//Estrutura da lista de flashcards de um deck

import { useState } from 'react'
import { useFlashcards } from '../../hooks/useFlashcards'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Pencil, Trash2, Search, Filter, SortAsc, Clock, Brain } from 'lucide-react'
import { EditFlashcardDialog } from './EditFlashcardDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu"
import { Checkbox } from '../ui/checkbox'
import { toast } from "sonner"

export function FlashcardList({ deckId }) {
  const { flashcards, deleteFlashcard } = useFlashcards(deckId)
  const [flashcardToDelete, setFlashcardToDelete] = useState(null)
  const [flashcardToEdit, setFlashcardToEdit] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created') // created, due, difficulty
  const [filter, setFilter] = useState('all') // all, due, new, learned
  const [selectedCards, setSelectedCards] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async (id) => {
    try {
      await deleteFlashcard(id)
      setFlashcardToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error)
    }
  }

  const getStatusBadge = (card) => {
    const nextReview = new Date(card.repetitionData.nextReview?.toDate?.() || card.repetitionData.nextReview)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (nextReview <= today) {
      return <Badge variant="destructive">Para Revisar</Badge>
    }
    if (card.repetitionData.repetitions === 0) {
      return <Badge variant="secondary">Novo</Badge>
    }
    return <Badge variant="outline">
      Próxima revisão: {nextReview.toLocaleDateString('pt-BR')}
    </Badge>
  }

  const filteredCards = flashcards
    .filter(card => {
      // Filtro de busca
      if (search) {
        const searchLower = search.toLowerCase()
        return card.front.toLowerCase().includes(searchLower) || 
               card.back.toLowerCase().includes(searchLower)
      }

      // Filtros de status
      switch (filter) {
        case 'due':
          return new Date(card.repetitionData.nextReview) <= new Date()
        case 'new':
          return card.repetitionData.repetitions === 0
        case 'learned':
          return card.repetitionData.repetitions > 0
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due':
          return new Date(a.repetitionData.nextReview) - new Date(b.repetitionData.nextReview)
        case 'difficulty':
          return a.repetitionData.easeFactor - b.repetitionData.easeFactor
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

  // Função para selecionar/deselecionar todos os cards
  const toggleSelectAll = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(filteredCards.map(card => card.id))
    }
  }

  // Função para selecionar/deselecionar um card
  const toggleSelectCard = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  // Função para excluir cards selecionados
  const handleDeleteSelected = async () => {
    try {
      await deleteFlashcard(selectedCards)
      toast.success(`${selectedCards.length} cards excluídos com sucesso!`)
      setSelectedCards([])
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao excluir cards:', error)
      toast.error('Erro ao excluir cards')
    }
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h3 className="text-xl font-medium mb-2">Nenhum flashcard criado</h3>
        <p className="text-muted-foreground">
          Comece criando seu primeiro flashcard usando o botão acima
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex gap-2">
          {selectedCards.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir ({selectedCards.length})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilter('all')}>
                <Brain className="h-4 w-4 mr-2" />
                Todos os cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('due')}>
                <Clock className="h-4 w-4 mr-2" />
                Para revisar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('new')}>
                Novos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('learned')}>
                Aprendidos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortBy('created')}>
                Data de criação
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('due')}>
                Data de revisão
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('difficulty')}>
                Dificuldade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lista de cards */}
      <div className="grid gap-4">
        {filteredCards.map((card) => (
          <Card key={card.id} className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Frente</h4>
                    <p className="text-sm text-muted-foreground">{card.front}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(card)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFlashcardToEdit(card)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Checkbox
                      checked={selectedCards.includes(card.id)}
                      onCheckedChange={() => toggleSelectCard(card.id)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Verso</h4>
                  <p className="text-sm text-muted-foreground">{card.back}</p>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span>Repetições: {card.repetitionData.repetitions}</span>
                    <span>Intervalo: {card.repetitionData.interval} dias</span>
                    <span>Fator de Facilidade: {card.repetitionData.easeFactor.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Opção "Selecionar todos" movida para baixo */}
      {filteredCards.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCards.length === filteredCards.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedCards.length > 0 
                ? `${selectedCards.length} cards selecionados`
                : 'Selecionar todos os cards'}
            </span>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cards selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedCards.length} cards.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditFlashcardDialog
        open={!!flashcardToEdit}
        onOpenChange={(open) => !open && setFlashcardToEdit(null)}
        flashcard={flashcardToEdit}
      />
    </div>
  )
}
