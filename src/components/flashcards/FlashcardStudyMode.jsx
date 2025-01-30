//Estrutura da tela de estudo de flashcards

import { useState, useEffect } from 'react'
import ReactCardFlip from 'react-card-flip'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { useFlashcards } from '../../hooks/useFlashcards'
import { ArrowLeft, Timer, Brain, Sparkles, BarChart3, Undo2 } from 'lucide-react'
import { Card } from '../ui/card'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'

const KEYBOARD_SHORTCUTS = {
  SPACE: ' ',
  NUMBERS: ['0', '1', '2', '3', '4'],
  ESC: 'Escape'
}

const RESPONSE_LABELS = {
  0: { text: 'Erro', color: 'text-red-600', bg: 'hover:bg-red-600/10' },
  1: { text: 'Difícil', color: 'text-orange-500', bg: 'hover:bg-orange-500/10' },
  2: { text: 'Bom', color: 'text-yellow-500', bg: 'hover:bg-yellow-500/10' },
  3: { text: 'Fácil', color: 'text-green-500', bg: 'hover:bg-green-500/10' },
  4: { text: 'Muito Fácil', color: 'text-blue-500', bg: 'hover:bg-blue-500/10' }
}

export function FlashcardStudyMode({ deck, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [studySession, setStudySession] = useState([])
  const [sessionStats, setSessionStats] = useState({
    easy: 0,
    good: 0,
    medium: 0,
    hard: 0,
    error: 0,
    total: 0,
    timeStarted: new Date()
  })

  const { flashcards, processAnswer } = useFlashcards(deck.id)

  // Filtra e embaralha os cards no início da sessão
  useEffect(() => {
    // Pega cards novos (repetitions = 0) e cards para revisar
    const cardsToStudy = flashcards.filter(card => {
      // Cards novos
      if (card.repetitionData.repetitions === 0) return true
      
      // Cards para revisar
      const nextReview = new Date(card.repetitionData.nextReview)
      const today = new Date()
      return nextReview.setHours(0,0,0,0) <= today.setHours(0,0,0,0)
    })
    
    const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5)
    setStudySession(shuffled)
  }, [flashcards])

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === KEYBOARD_SHORTCUTS.SPACE) {
        setIsFlipped(prev => !prev)
      } else if (KEYBOARD_SHORTCUTS.NUMBERS.includes(e.key) && isFlipped) {
        handleAnswer(parseInt(e.key))
      } else if (e.key === KEYBOARD_SHORTCUTS.ESC) {
        onExit()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipped])

  const currentCard = studySession[currentIndex]
  const progress = (currentIndex / studySession.length) * 100

  const handleAnswer = async (quality) => {
    if (isTransitioning) return

    setIsTransitioning(true)
    
    const currentCard = studySession[currentIndex]
    
    try {
      await processAnswer(currentCard, quality)
      
      // Atualiza estatísticas
      setSessionStats(prev => ({
        ...prev,
        [getQualityKey(quality)]: prev[getQualityKey(quality)] + 1,
        total: prev.total + 1
      }))

      // Espera a carta virar de volta antes de mudar
      setIsFlipped(false)
      
      // Aguarda a animação de flip terminar
      setTimeout(() => {
        if (currentIndex < studySession.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          onExit()
        }
        setIsTransitioning(false)
      }, 300)

    } catch (error) {
      console.error('Erro ao processar resposta:', error)
      toast.error('Erro ao processar resposta')
      setIsTransitioning(false)
    }
  }

  const getSessionDuration = () => {
    const duration = Math.floor((new Date() - sessionStats.timeStarted) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const answerButtons = [
    { quality: 0, label: 'Erro', color: 'text-red-500' },
    { quality: 1, label: 'Difícil', color: 'text-orange-500' },
    { quality: 2, label: 'Bom', color: 'text-yellow-500' },
    { quality: 3, label: 'Fácil', color: 'text-green-500' },
    { quality: 4, label: 'Muito Fácil', color: 'text-blue-500' }
  ]

  if (studySession.length === 0 || currentIndex >= studySession.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <h3 className="text-xl font-medium">
          Parabéns! Você completou todos os cards para hoje.
        </h3>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Tempo de Estudo</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{getSessionDuration()}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-orange-500" />
              <h3 className="font-medium">Cards Estudados</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{sessionStats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">Taxa de Acerto</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {sessionStats.total > 0
                ? Math.round(((sessionStats.easy + sessionStats.good) / sessionStats.total) * 100)
                : 0}%
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">Desempenho</h3>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Fácil</span>
                <span>{sessionStats.easy}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bom</span>
                <span>{sessionStats.good}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Médio</span>
                <span>{sessionStats.medium}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Difícil</span>
                <span>{sessionStats.hard}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Erro</span>
                <span>{sessionStats.error}</span>
              </div>
            </div>
          </Card>
        </div>
        <Button 
          variant="default" 
          onClick={onExit}
          className="mt-4"
        >
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-sm text-muted-foreground space-x-4">
          <span>{currentIndex + 1} de {studySession.length}</span>
          <span>⏱️ {getSessionDuration()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso: {Math.round(progress)}%</span>
          <span>Restantes: {studySession.length - currentIndex}</span>
        </div>
      </div>

      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Frente do Card */}
        <div className="w-full">
          <Card className="w-full p-6">
            <div className="min-h-[200px] flex items-center justify-center text-center">
              {!isTransitioning && studySession[currentIndex]?.front}
            </div>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => !isTransitioning && setIsFlipped(true)}
              disabled={isTransitioning}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Virar card (Espaço)
            </Button>
          </Card>
        </div>

        {/* Verso do Card */}
        <div className="w-full">
          <Card className="w-full p-6">
            <div className="min-h-[200px] flex items-center justify-center text-center">
              {!isTransitioning && studySession[currentIndex]?.back}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {answerButtons.map(({ quality, label, color }) => (
                <Button
                  key={quality}
                  onClick={() => handleAnswer(quality)}
                  disabled={isTransitioning}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-4 h-auto gap-1 hover:bg-slate-100 ${color}`}
                >
                  <span className="text-lg font-medium">{quality}</span>
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </ReactCardFlip>

      <div className="text-sm text-muted-foreground text-center mt-4">
        Dica: Use as teclas 0-4 para responder e Espaço para virar o card
      </div>
    </div>
  )
}

// Função auxiliar para mapear qualidade para chave de estatística
function getQualityKey(quality) {
  switch (quality) {
    case 0: return 'error'
    case 1: return 'hard'
    case 2: return 'medium'
    case 3: return 'good'
    case 4: return 'easy'
    default: return 'medium'
  }
} 