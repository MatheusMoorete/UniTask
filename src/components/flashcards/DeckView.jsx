//Estrutura da visualização detelhada de um deck
import { useState } from 'react'
import PropTypes from 'prop-types'
import { ArrowLeft, Plus, Brain, BarChart3, Clock, Calendar, Play, List, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import FlashcardList from './FlashcardList'
import { CreateFlashcardDialog } from './CreateFlashcardDialog'
import FlashcardStudyMode from './FlashcardStudyMode'
import { useFlashcards } from '../../hooks/useFlashcards'
import { DeckOptionsMenu } from './DeckOptionsMenu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { GenerateAIFlashcardsDialog } from './GenerateAIFlashcardsDialog'
import { motion } from 'framer-motion'

export default function DeckView({ deck, onBack }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false)
  const { flashcards, getDueCards } = useFlashcards(deck.id)

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
    <motion.div 
      className="container space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col gap-4"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{deck.name}</h1>
              <p className="text-muted-foreground">{deck.description}</p>
            </div>
          </div>
          <DeckOptionsMenu deck={deck} onDelete={onBack} />
        </div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cards</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total === 0 ? 'Nenhum card criado' : 
                    `${stats.learned} cards aprendidos`}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Para Revisar</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dueToday}</div>
                <p className="text-xs text-muted-foreground">
                  Cards para revisar hoje
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprendizado</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.total > 0 ? `${Math.round((stats.learned / stats.total) * 100)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cards dominados
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Intervalo Médio</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageInterval}</div>
                <p className="text-xs text-muted-foreground">
                  Dias entre revisões
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="space-y-6"
        variants={itemVariants}
      >
        {stats.dueToday > 0 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle>Hora de Estudar!</CardTitle>
                <CardDescription>
                  Você tem {stats.dueToday} {stats.dueToday === 1 ? 'card' : 'cards'} para revisar hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsStudyMode(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Revisão
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="cards" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="cards" className="gap-2">
                  <List className="h-4 w-4" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsAIGeneratorOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar com IA
                </Button>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Card
                </Button>
              </div>
            </div>

            <TabsContent value="cards" className="space-y-4">
              <FlashcardList deckId={deck.id} />
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Detalhadas</CardTitle>
                  <CardDescription>
                    Acompanhe seu progresso e desempenho
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Em breve
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

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
    </motion.div>
  )
}

DeckView.propTypes = {
  deck: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  onBack: PropTypes.func.isRequired
}