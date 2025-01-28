import { useState } from 'react'
import { Plus, Brain, BarChart3, Clock, Package } from 'lucide-react'
import { Button } from '../components/ui/button'
import { FlashcardList } from '../components/flashcards/FlashcardList'
import { CreateFlashcardDialog } from '../components/flashcards/CreateFlashcardDialog'
import { useFlashcards } from '../hooks/useFlashcards'
import { FlashcardStudyMode } from '../components/flashcards/FlashcardStudyMode'
import { Card } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { useDecks } from '../hooks/useDecks'
import { CreateDeckDialog } from '../components/flashcards/CreateDeckDialog'
import { DeckView } from '../components/flashcards/DeckView'

export default function Flashcards() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState('all')
  const { flashcards, isLoading } = useFlashcards()
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState(null)
  const { decks, isLoading: decksLoading } = useDecks()

  const dueTodayCount = flashcards.filter(card => {
    const nextReview = new Date(card.repetitionData.nextReview)
    return nextReview <= new Date()
  }).length

  const stats = {
    total: flashcards.length,
    dueToday: dueTodayCount,
    learned: flashcards.filter(card => card.repetitionData.repetitions > 0).length,
    averageInterval: Math.round(
      flashcards.reduce((acc, card) => acc + card.repetitionData.interval, 0) / flashcards.length
    ) || 0
  }

  if (selectedDeck) {
    return <DeckView deck={selectedDeck} onBack={() => setSelectedDeck(null)} />
  }

  if (isStudyMode) {
    return <FlashcardStudyMode onExit={() => setIsStudyMode(false)} />
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Meus Decks</h2>
          <p className="text-muted-foreground">
            Organize seus flashcards em decks
          </p>
        </div>
        <Button onClick={() => setIsCreateDeckOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Deck
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <Card 
            key={deck.id}
            className="p-6 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedDeck(deck)}
          >
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-medium">{deck.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {deck.description}
            </p>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Cards: {deck.totalCards || 0}</span>
              <span>Para revisar: {deck.dueCards || 0}</span>
            </div>
          </Card>
        ))}
      </div>

      <CreateDeckDialog 
        open={isCreateDeckOpen}
        onOpenChange={setIsCreateDeckOpen}
      />
    </div>
  )
} 