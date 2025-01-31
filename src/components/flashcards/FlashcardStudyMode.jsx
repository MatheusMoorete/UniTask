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

function FlashcardStudyMode({ deck: deckProp, onExit }) {
  const { 
    deck = deckProp, 
    flashcards, 
    processAnswer, 
    finishSession, 
    isLoading: isLoadingCards,
    getDueCards 
  } = useFlashcards(deckProp?.id)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [startTime] = useState(new Date())
  const [showStats, setShowStats] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFinished, setHasFinished] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [dueCards, setDueCards] = useState([])
  const [stats, setStats] = useState({
    totalTime: 0,
    correctAnswers: 0,
    totalCards: 0
  })

  useEffect(() => {
    toast.info(
      'Atalhos do teclado:\n' +
      'Espaço - Virar card\n' +
      '0-4 - Avaliar card\n' +
      'ESC - Voltar',
      {
        duration: 5000,
        position: 'bottom-right',
        id: 'keyboard-shortcuts'
      }
    )
  }, [])

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Previne o comportamento padrão para as teclas que usamos
      if ([...KEYBOARD_SHORTCUTS.NUMBERS, KEYBOARD_SHORTCUTS.SPACE, KEYBOARD_SHORTCUTS.ESC].includes(event.key)) {
        event.preventDefault()
      }

      // Se pressionar ESC, volta para a tela anterior
      if (event.key === KEYBOARD_SHORTCUTS.ESC) {
        window.history.back()
        return
      }

      // Se pressionar espaço, vira o card
      if (event.key === KEYBOARD_SHORTCUTS.SPACE) {
        handleFlip()
        return
      }

      // Se o card estiver virado e pressionar um número, registra a resposta
      if (isFlipped && KEYBOARD_SHORTCUTS.NUMBERS.includes(event.key)) {
        const quality = parseInt(event.key)
        handleAnswer(quality)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipped])

  useEffect(() => {
    if (flashcards?.length > 0) {
      const cardsToReview = getDueCards()
      setDueCards(cardsToReview)
      setStats(prev => ({
        ...prev,
        totalCards: cardsToReview.length
      }))
    }
  }, [flashcards, getDueCards])

  useEffect(() => {
    const newProgress = (currentIndex / dueCards.length) * 100
    setProgress(newProgress)
  }, [currentIndex, dueCards.length])

  useEffect(() => {
    if (currentIndex === dueCards.length && !hasFinished && dueCards.length > 0) {
      const endTime = new Date()
      const totalTime = Math.round((endTime - startTime) / 1000)
      setStats(prev => ({
        ...prev,
        totalTime
      }))
      setShowStats(true)
      setHasFinished(true)
      finishSession?.()
    }
  }, [currentIndex, dueCards.length, startTime, finishSession, hasFinished])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = async (quality) => {
    try {
      setIsLoading(true)
      if (quality >= 3) {
        setStats(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1
        }))
      }
      
      if (processAnswer) {
        await processAnswer(dueCards[currentIndex], quality)
      }
      
      setIsFlipped(false)
      setCurrentIndex(prev => prev + 1)
      if (currentIndex === 0) {
        setShowHint(false)
      }
    } catch (err) {
      console.error('Erro ao processar resposta:', err)
      setError('Ocorreu um erro ao processar sua resposta. Tente novamente.')
      toast.error('Erro ao processar resposta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (onExit) {
      onExit()
    } else {
      window.history.back()
    }
  }

  if (isLoadingCards) {
    return (
      <div className="container mx-auto max-w-3xl py-6 px-4">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Carregando flashcards...</h2>
            <div className="animate-pulse flex justify-center">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!dueCards?.length) {
    return (
      <div className="container mx-auto max-w-3xl py-6 px-4">
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Nenhum cartão para revisar</h2>
            <p className="text-muted-foreground">
              Você não tem cartões para revisar neste momento. Volte mais tarde!
            </p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (currentIndex >= dueCards.length) {
    return (
      <div className="container mx-auto max-w-3xl py-6 px-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Sessão Finalizada</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Total</p>
              <p className="text-xl font-medium">{Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
              <p className="text-xl font-medium">{Math.round((stats.correctAnswers / stats.totalCards) * 100)}%</p>
            </div>
          </div>
          <Button className="mt-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Card>
      </div>
    )
  }

  const currentCard = dueCards[currentIndex]
  if (!currentCard) return null

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="flex items-center gap-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h2 className="text-xl font-semibold">{deck?.title || deck?.name}</h2>
        </div>
        <div className="text-sm text-muted-foreground space-x-4">
          <span>{currentIndex + 1} de {dueCards.length}</span>
          <span>⏱️ {Math.floor((new Date() - startTime) / 1000)}s</span>
        </div>
      </div>

      <div className="space-y-2">
        <Progress 
          value={progress} 
          aria-label="Progresso do estudo" 
          className={cn(
            "transition-all duration-300",
            isLoading && "opacity-50"
          )} 
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso: {Math.round(progress)}%</span>
          <span>Restantes: {dueCards.length - currentIndex}</span>
        </div>
      </div>

      <div className="mt-6 transform transition-all duration-300">
        <ReactCardFlip isFlipped={isFlipped}>
          <div className="w-full">
            <Card 
              className={cn(
                "w-full p-6 transform transition-all duration-300 hover:shadow-lg",
                isLoading && "opacity-50 pointer-events-none"
              )} 
              role="region" 
              aria-label="Frente do cartão"
            >
              <div className="min-h-[200px] flex items-center justify-center text-center">
                {currentCard.front}
              </div>
              <Button 
                className="w-full transform transition-all duration-300 hover:scale-[1.02]" 
                onClick={handleFlip} 
                aria-label="Virar cartão"
              >
                <Undo2 className="w-4 h-4 mr-2 animate-pulse" aria-hidden="true" />
                Virar card (Espaço)
              </Button>
            </Card>
          </div>

          <div className="w-full">
            <Card 
              className={cn(
                "w-full p-6 transform transition-all duration-300 hover:shadow-lg",
                isLoading && "opacity-50 pointer-events-none"
              )} 
              role="region" 
              aria-label="Verso do cartão"
            >
              <div className="min-h-[200px] flex items-center justify-center text-center">
                {currentCard.back}
              </div>
              <div className="grid grid-cols-5 gap-2 mt-4" role="group" aria-label="Opções de resposta">
                {Object.entries(RESPONSE_LABELS).map(([quality, { text, color, bg }]) => (
                  <Button
                    key={quality}
                    variant="outline"
                    className={cn(
                      "flex flex-col items-center justify-center p-4 h-auto gap-1 transform transition-all duration-300 hover:scale-[1.05]",
                      color,
                      bg,
                      isLoading && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => handleAnswer(parseInt(quality))}
                    aria-label={`Responder ${text}`}
                    disabled={isLoading}
                  >
                    <span className="text-lg font-medium">{quality}</span>
                    <span className="text-sm">{text}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </ReactCardFlip>
      </div>

      {showHint && currentIndex === 0 && (
        <div 
          className={cn(
            "text-sm text-muted-foreground text-center mt-4 animate-pulse",
            isLoading && "opacity-50"
          )} 
          role="note"
        >
          Dica: Use as teclas 0-4 para responder e Espaço para virar o card
        </div>
      )}
    </div>
  )
}

export default FlashcardStudyMode

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