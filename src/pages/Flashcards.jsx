//Estrutura principal da pagina de flashcards

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import FlashcardStudyMode from '../components/flashcards/FlashcardStudyMode'
import { useDecks } from '../hooks/useDecks'
import { CreateDeckDialog } from '../components/flashcards/CreateDeckDialog'
import DeckView from '../components/flashcards/DeckView'
import { DeckCard } from '../components/flashcards/DeckCard'

export default function Flashcards() {
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState(null)
  const { decks, isLoading } = useDecks()

  if (selectedDeck) {
    return <DeckView deck={selectedDeck} onBack={() => setSelectedDeck(null)} />
  }

  if (isStudyMode) {
    return <FlashcardStudyMode onExit={() => setIsStudyMode(false)} />
  }

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Meus Decks</h1>
          <p className="text-muted-foreground">
            Organize seus flashcards em decks
          </p>
        </div>
        <Button onClick={() => setIsCreateDeckOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Deck
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Nenhum deck criado</h3>
          <p className="text-muted-foreground mt-1">
            Crie seu primeiro deck para começar a estudar
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onClick={() => setSelectedDeck(deck)}
            />
          ))}
        </div>
      )}

      <CreateDeckDialog
        open={isCreateDeckOpen}
        onOpenChange={setIsCreateDeckOpen}
      />
    </div>
  )
}
