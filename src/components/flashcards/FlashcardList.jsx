//Estrutura da lista de flashcards de um deck

import { useState, useMemo } from 'react'
import { useFlashcards } from '@/hooks/useFlashcards'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Pencil, Trash2, Search, Filter, SortAsc, Clock, Brain, ArrowUpNarrowWide } from 'lucide-react'
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

export default function FlashcardList({ deckId }) {
  const { flashcards, deleteFlashcards } = useFlashcards(deckId)
  const [flashcardToDelete, setFlashcardToDelete] = useState(null)
  const [flashcardToEdit, setFlashcardToEdit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCards, setSelectedCards] = useState([])
  const [sortBy, setSortBy] = useState('created')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterBy, setFilterBy] = useState('all')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const filteredCards = useMemo(() => {
    return flashcards
      .filter(card => {
        const matchesSearch = searchQuery === '' || 
          card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.back.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterBy === 'all' || 
          (filterBy === 'due' && card.isDue) ||
          (filterBy === 'learned' && !card.isDue)

        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1
        switch (sortBy) {
          case 'front':
            return a.front.localeCompare(b.front) * order
          case 'back':
            return a.back.localeCompare(b.back) * order
          case 'created':
            return (new Date(a.createdAt) - new Date(b.createdAt)) * order
          default:
            return 0
        }
      })
  }, [flashcards, searchQuery, filterBy, sortBy, sortOrder])

  const handleDelete = async (id) => {
    try {
      await deleteFlashcards(id)
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

  const handleSelectCard = (cardId) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      } else {
        return [...prev, cardId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(filteredCards.map(card => card.id))
    }
  }

  const handleDeleteSelected = async () => {
    try {
      await deleteFlashcards(selectedCards)
      setSelectedCards([])
      setShowDeleteDialog(false)
      toast.success(`${selectedCards.length} cards excluídos com sucesso!`)
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                <Brain className="h-4 w-4 mr-2" />
                Todos os cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('due')}>
                <Clock className="h-4 w-4 mr-2" />
                Para revisar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('learned')}>
                Aprendidos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ArrowUpNarrowWide className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortBy('created')}>
                Data de criação
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('front')}>
                Frente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('back')}>
                Verso
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
                      onCheckedChange={() => handleSelectCard(card.id)}
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
              onCheckedChange={handleSelectAll}
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
