//Sistema de visualização e filtragem de flashcards

import { useState } from 'react'
import { Search, Filter, SortAsc, Clock, Brain, Trash2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Badge } from '../ui/badge'
import { useFlashcards } from '../../contexts/FlashcardsContext'
import { showToast } from '../../lib/toast'

export function FlashcardBrowser({ flashcards, deckId }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created') // created, due, difficulty
  const [filter, setFilter] = useState('all') // all, due, new, learned
  const [selectedCards, setSelectedCards] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { deleteFlashcard } = useFlashcards(deckId)

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
          const nextReview = new Date(card.repetitionData.nextReview?.toDate?.() || card.repetitionData.nextReview)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          nextReview.setHours(0, 0, 0, 0)
          return nextReview <= today
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

  const getStatusBadge = (card) => {
    if (new Date(card.repetitionData.nextReview) <= new Date()) {
      return <Badge variant="destructive">Para Revisar</Badge>
    }
    if (card.repetitionData.repetitions === 0) {
      return <Badge variant="secondary">Novo</Badge>
    }
    return <Badge variant="outline">
      Próxima revisão: {new Date(card.repetitionData.nextReview).toLocaleDateString()}
    </Badge>
  }

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
      showToast.success(`${selectedCards.length} cards excluídos com sucesso!`)
      setSelectedCards([])
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao excluir cards:', error)
      showToast.error('Erro ao excluir cards')
    }
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
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          {selectedCards.length > 0 && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
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

      {/* Cabeçalho da lista com checkbox "Selecionar todos" */}
      {filteredCards.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <Checkbox
            checked={selectedCards.length === filteredCards.length}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedCards.length > 0 
              ? `${selectedCards.length} cards selecionados`
              : 'Selecionar todos'}
          </span>
        </div>
      )}

      {/* Lista de cards */}
      <div className="grid gap-4">
        {filteredCards.map((card) => (
          <Card key={card.id} className="p-4">
            <div className="flex gap-4">
              <Checkbox
                checked={selectedCards.includes(card.id)}
                onCheckedChange={() => toggleSelectCard(card.id)}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Frente</h4>
                    <p className="text-sm text-muted-foreground">{card.front}</p>
                  </div>
                  {getStatusBadge(card)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Verso</h4>
                  <p className="text-sm text-muted-foreground">{card.back}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog de confirmação de exclusão */}
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
    </div>
  )
} 