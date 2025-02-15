//Estrutura principal da pagina de flashcards

import { useState } from 'react'
import { Plus, Search, Brain, Clock, Filter, SortAsc } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu"
import FlashcardStudyMode from '../components/flashcards/FlashcardStudyMode'
import { useDecks } from '../hooks/useDecks'
import { CreateDeckDialog } from '../components/flashcards/CreateDeckDialog'
import DeckView from '../components/flashcards/DeckView'
import { DeckCard } from '../components/flashcards/DeckCard'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'

export default function Flashcards() {
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // name, cards, dueCards
  const [filterBy, setFilterBy] = useState('all') // all, withDue, empty
  const { decks, isLoading } = useDecks()

  // Configurações de animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  if (selectedDeck) {
    return <DeckView deck={selectedDeck} onBack={() => setSelectedDeck(null)} />
  }

  if (isStudyMode) {
    return <FlashcardStudyMode onExit={() => setIsStudyMode(false)} />
  }

  const filteredDecks = decks
    .filter(deck => {
      const matchesSearch = searchQuery === '' || 
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase())

      switch (filterBy) {
        case 'withDue':
          return matchesSearch && deck.dueCards > 0
        case 'empty':
          return matchesSearch && deck.totalCards === 0
        default:
          return matchesSearch
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'cards':
          return b.totalCards - a.totalCards
        case 'dueCards':
          return b.dueCards - a.dueCards
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <motion.div 
      className="container space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex flex-col gap-4"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Flashcards</h1>
            <p className="text-muted-foreground">
              Gerencie seus decks e estude com flashcards
            </p>
          </div>
          <Button onClick={() => setIsCreateDeckOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Deck
          </Button>
        </div>

        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                <Brain className="h-4 w-4 mr-2" />
                Todos os decks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('withDue')}>
                <Clock className="h-4 w-4 mr-2" />
                Com cards para revisar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('empty')}>
                Decks vazios
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
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Nome
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('cards')}>
                Quantidade de cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('dueCards')}>
                Cards para revisar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>

      <motion.div 
        className={cn(
          "grid gap-4",
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
        variants={containerVariants}
      >
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="h-[140px] bg-muted animate-pulse rounded-lg"
            />
          ))
        ) : filteredDecks.length === 0 ? (
          <motion.div 
            className="col-span-full"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum deck encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery 
                  ? 'Tente mudar os filtros ou termos de busca'
                  : 'Crie seu primeiro deck para começar a estudar'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setIsCreateDeckOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Deck
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          filteredDecks.map((deck, index) => (
            <motion.div
              key={deck.id}
              variants={itemVariants}
              custom={index}
            >
              <DeckCard
                deck={deck}
                onClick={() => setSelectedDeck(deck)}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      <CreateDeckDialog
        open={isCreateDeckOpen}
        onOpenChange={setIsCreateDeckOpen}
      />
    </motion.div>
  )
}
