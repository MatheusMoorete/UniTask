//Estrutura da visualização detelhada de um deck

import { useState } from 'react'
import { ArrowLeft, Plus, Brain, BarChart3, Clock, Calendar, Play, List, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import FlashcardList from './FlashcardList'
import { CreateFlashcardDialog } from './CreateFlashcardDialog'
import FlashcardStudyMode from './FlashcardStudyMode'
import { useFlashcards } from '../../hooks/useFlashcards'
import { DeckOptionsMenu } from './DeckOptionsMenu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { GenerateAIFlashcardsDialog } from './GenerateAIFlashcardsDialog'

export default function DeckView({ deck, onBack }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false)
  const { flashcards, getDueCards } = useFlashcards(deck.id)

  const stats = {
    total: flashcards.length,
    dueToday: getDueCards().length,
    learned: flashcards.filter(card => 
      card.repetitionData && card.repetitionData.repetitions > 0
    ).length,
    averageInterval: Math.round(
      flashcards.reduce((acc, card) => 
        acc + (card.repetitionData?.interval || 0), 0
      ) / flashcards.length
    ) || 0
  }

  if (isStudyMode) {
    return <FlashcardStudyMode deck={deck} onExit={() => setIsStudyMode(false)} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-xl font-bold">{deck.name}</h2>
            <p className="text-sm text-muted-foreground">{deck.description}</p>
          </div>
        </div>
        <DeckOptionsMenu deck={deck} onDelete={onBack} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Total de Cards</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <h3 className="font-medium">Para Revisar Hoje</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.dueToday}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-500" />
            <h3 className="font-medium">Cards Aprendidos</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.learned}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Intervalo Médio</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.averageInterval} dias</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <Card className="w-full max-w-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Estudar Agora</h3>
                  <p className="text-sm text-muted-foreground">
                    {getDueCards().length} cards para revisar hoje
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => setIsStudyMode(true)}
                  disabled={flashcards.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Estudo
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="cards">
            <TabsList className="w-full">
              <TabsTrigger value="cards" className="flex-1">
                <List className="h-4 w-4 mr-2" />
                Todos os Cards
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cards">
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" onClick={() => setIsAIGeneratorOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar com IA
                </Button>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Card
                </Button>
              </div>
              <FlashcardList deckId={deck.id} />
            </TabsContent>
            <TabsContent value="stats">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Em breve</h3>
                <p className="text-sm text-muted-foreground">
                  Estatísticas detalhadas sobre seu progresso
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateFlashcardDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        deckId={deck.id}
      />

      <GenerateAIFlashcardsDialog
        open={isAIGeneratorOpen}
        onOpenChange={setIsAIGeneratorOpen}
        deckId={deck.id}
      />
    </div>
  )
}