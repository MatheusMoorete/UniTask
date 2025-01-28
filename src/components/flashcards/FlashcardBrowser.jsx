import { useState } from 'react'
import { Search, Filter, SortAsc, Clock, Brain } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu"
import { Badge } from '../ui/badge'

export function FlashcardBrowser({ flashcards }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created') // created, due, difficulty
  const [filter, setFilter] = useState('all') // all, due, new, learned

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        
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

      <div className="grid gap-4">
        {filteredCards.map((card) => (
          <Card key={card.id} className="p-4">
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
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Repetições: {card.repetitionData.repetitions}</span>
                <span>Intervalo: {card.repetitionData.interval} dias</span>
                <span>Fator de Facilidade: {card.repetitionData.easeFactor.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 